/**
 * server/src/services/transactionService.js
 *
 * Server-side transaction orchestration service.
 * Handles validation, server-side recalculation of quotes and fees,
 * pre-execution quote expiry checks, risk enforcement, adapter dispatch,
 * and controlled status lifecycle transitions.
 */

import { transactionRepository } from '../repositories/TransactionRepository.js';
import { idempotencyRepository } from '../repositories/IdempotencyRepository.js';
import { recipientRepository } from '../repositories/RecipientRepository.js';
import { fxService } from './fxService.js';
import { riskService } from './riskService.js';
import { getAdapter } from '../../../integrations/factory.js';
import { TRANSACTION_STATUS, TERMINAL_STATUSES } from '../../../shared/constants/transactionStatus.js';
import { RAIL_CATALOG } from '../config/orchestrationConfig.js';

// Controlled State Machine Transition Graph
const VALID_TRANSITIONS = {
  [TRANSACTION_STATUS.PENDING]: [
    TRANSACTION_STATUS.COMPLIANCE_REVIEW,
    TRANSACTION_STATUS.ROUTE_SELECTED,
    TRANSACTION_STATUS.PROCESSING,
    TRANSACTION_STATUS.CANCELLED,
  ],
  [TRANSACTION_STATUS.COMPLIANCE_REVIEW]: [
    TRANSACTION_STATUS.ROUTE_SELECTED,
    TRANSACTION_STATUS.PROCESSING,
    TRANSACTION_STATUS.COMPLIANCE_REJECTED,
    TRANSACTION_STATUS.CANCELLED,
  ],
  [TRANSACTION_STATUS.ROUTE_SELECTED]: [
    TRANSACTION_STATUS.PROCESSING,
    TRANSACTION_STATUS.CANCELLED,
  ],
  [TRANSACTION_STATUS.PROCESSING]: [
    TRANSACTION_STATUS.SETTLEMENT_PENDING,
    TRANSACTION_STATUS.COMPLETED,
    TRANSACTION_STATUS.FAILED,
  ],
  [TRANSACTION_STATUS.SETTLEMENT_PENDING]: [
    TRANSACTION_STATUS.COMPLETED,
    TRANSACTION_STATUS.FAILED,
  ],
  [TRANSACTION_STATUS.COMPLETED]: [],
  [TRANSACTION_STATUS.FAILED]: [TRANSACTION_STATUS.REFUNDED],
  [TRANSACTION_STATUS.REFUNDED]: [],
  [TRANSACTION_STATUS.CANCELLED]: [],
  [TRANSACTION_STATUS.COMPLIANCE_REJECTED]: [],
};

export class TransactionService {
  /**
   * Creates a transaction with idempotency protection and pre-flight revalidation.
   */
  async createTransaction(payload, idempotencyKey = null) {
    // 1. Idempotency check: if previously submitted with this key, return saved result
    if (idempotencyKey) {
      const cached = await idempotencyRepository.get(idempotencyKey);
      if (cached && cached.response) {
        return { ...cached.response, isIdempotentReplay: true };
      }
    }

    const {
      amount,
      fromCurrency = 'AED',
      recipientId,
      recipient,
      purpose = 'Family support',
      routeId = 'upi_partner',
      senderName = 'Arjun Patel',
      senderCountry = 'United Arab Emirates',
      senderCountryCode = 'AE',
      quoteExpiresAt = null,
    } = payload;

    // 2. Pre-flight quote expiration check
    if (quoteExpiresAt) {
      const expiry = new Date(quoteExpiresAt).getTime();
      if (!isNaN(expiry) && expiry < Date.now()) {
        throw new Error('Submitted quote has expired. Please refresh the quote before confirming transfer.');
      }
    }

    // 3. Resolve recipient
    let resolvedRecipient = recipient;
    if (recipientId && !resolvedRecipient) {
      resolvedRecipient = await recipientRepository.findById(recipientId);
    }
    if (!resolvedRecipient) {
      throw new Error('Recipient information is required (recipientId or recipient object).');
    }
    if (!resolvedRecipient.name || !resolvedRecipient.upiId) {
      throw new Error('Recipient must have a valid name and UPI address.');
    }

    // 4. Validate and recalculate FX quote server-side (server is source of truth!)
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Amount must be a positive number.');
    }

    const quote = fxService.calculateQuote({
      fromAmount: numericAmount,
      fromCurrency,
      routeId,
    });

    // 5. Pre-flight Rail Availability check
    const railDef = RAIL_CATALOG.find(r => r.id === routeId);
    if (!railDef || !railDef.isAvailable) {
      throw new Error(`The selected payment rail "${railDef ? railDef.name : routeId}" is unavailable for execution in this environment.`);
    }

    const adapter = getAdapter(railDef.adapterKey);
    const available = await adapter.isAvailable();
    if (!available) {
      throw new Error(`The selected payment rail "${adapter.name}" is unavailable for execution in this environment.`);
    }

    // 6. Pre-execution Risk Analysis (server-side)
    const riskAssessment = riskService.evaluate({
      fromAmount: numericAmount,
      fromCurrency,
      recipientUpi: resolvedRecipient.upiId,
      recipientName: resolvedRecipient.name,
      senderName,
      purpose,
      corridor: `${senderCountryCode}_INR`,
    });

    if (riskAssessment.isBlocked) {
      throw new Error(`Transaction blocked by risk & sanctions compliance engine: ${riskAssessment.level} risk detected.`);
    }

    // 7. Generate transaction identifiers
    const timestamp = Date.now();
    const sequenceNum = Math.floor(Math.random() * 900) + 100;
    const txId = `TXN-D-00${sequenceNum}`;

    // 8. Execute adapter transfer
    let adapterResult = null;
    try {
      adapterResult = await adapter.initiateTransfer({
        transactionId: txId,
        amount: quote.fromAmount,
        currency: quote.fromCurrency,
        recipient: resolvedRecipient,
      });
    } catch (err) {
      console.warn(`[TransactionService] Adapter execution failed: ${err.message}`);
      adapterResult = {
        railTransactionId: `sim_fail_${timestamp}`,
        status: TRANSACTION_STATUS.FAILED,
        metadata: { error: err.message },
      };
    }

    const initialStatus = riskAssessment.requiresManualReview
      ? TRANSACTION_STATUS.COMPLIANCE_REVIEW
      : adapterResult?.status || TRANSACTION_STATUS.PROCESSING;

    // 9. Build comprehensive transaction record
    const transaction = {
      id: txId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      senderName,
      senderCountry,
      senderCountryCode,
      senderCurrency: quote.fromCurrency,
      recipientName: resolvedRecipient.name,
      recipientUpi: resolvedRecipient.upiId,
      recipientBank: resolvedRecipient.bankName || 'Verified Beneficiary Bank',
      recipientId: resolvedRecipient.id || null,
      fromAmount: quote.fromAmount,
      fromCurrency: quote.fromCurrency,
      toAmount: quote.recipientINR,
      toCurrency: 'INR',
      fxRate: quote.appliedRate,
      midMarketRate: quote.midRate,
      transferFee: quote.feeAmount,
      fxFee: quote.fxCost,
      totalFee: quote.totalCost,
      route: routeId,
      routeName: quote.routeName,
      routeShort: railDef.shortName,
      status: initialStatus,
      statusLabel: initialStatus === TRANSACTION_STATUS.COMPLIANCE_REVIEW ? 'Pending Review (simulated)' : 'Processing (simulated)',
      purpose,
      settlementTime: railDef.etaMinutes,
      settlementTimeLabel: railDef.typicalSpeedLabel,
      railTransactionId: adapterResult?.railTransactionId || null,
      providerReference: adapterResult?.providerReference || null,
      blockchainTxHash: adapterResult?.metadata?.txHash || null,
      isBlockchain: routeId === 'blockchain_partner' || routeId === 'blockchain',
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      riskAssessment,
      provenance: railDef.provenance,
      isSimulated: true,
      note: 'Simulated transfer created. No money has moved.',
      timeline: [
        {
          status: TRANSACTION_STATUS.PENDING,
          title: 'Transfer initiated',
          description: `Transfer of ${quote.fromCurrency} ${quote.fromAmount.toFixed(2)} to ${resolvedRecipient.name} was registered.`,
          timestamp: new Date().toISOString(),
          actor: 'Sender',
        },
        {
          status: TRANSACTION_STATUS.ROUTE_SELECTED,
          title: 'Route selected & rate locked',
          description: `Orchestrator selected ${quote.routeName} at effective rate of ₹${quote.appliedRate.toFixed(4)}.`,
          timestamp: new Date().toISOString(),
          actor: 'Orchestration Engine',
        },
        {
          status: initialStatus,
          title: initialStatus === TRANSACTION_STATUS.COMPLIANCE_REVIEW ? 'Queued for compliance review' : 'Dispatched to payment adapter',
          description: initialStatus === TRANSACTION_STATUS.COMPLIANCE_REVIEW
            ? `Risk score ${riskAssessment.score} flagged for secondary review.`
            : `Handed over to ${adapter.name} (${adapterResult?.providerReference || 'simulated reference'}).`,
          timestamp: new Date().toISOString(),
          actor: adapter.name,
        },
      ],
    };

    // 10. Persist to storage
    const createdTx = await transactionRepository.create(transaction);

    // 11. Cache in idempotency repository if key was provided
    if (idempotencyKey) {
      await idempotencyRepository.save(idempotencyKey, createdTx);
    }

    return createdTx;
  }

  async getAllTransactions(query = {}) {
    return transactionRepository.findAll(query);
  }

  async getTransactionById(id) {
    const tx = await transactionRepository.findById(id);
    if (!tx) {
      throw new Error(`Transaction with ID "${id}" was not found.`);
    }
    return tx;
  }

  /**
   * Updates transaction status adhering strictly to state machine transitions.
   */
  async updateStatus(id, newStatus, reason = '') {
    const tx = await this.getTransactionById(id);

    // Reject transitions from terminal states
    if (TERMINAL_STATUSES.includes(tx.status)) {
      throw new Error(`Invalid status transition from "${tx.status}" to "${newStatus}". Allowed next statuses: None (Terminal state)`);
    }

    const allowed = VALID_TRANSITIONS[tx.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition from "${tx.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'None'}`);
    }

    const updatedTimeline = [
      ...(tx.timeline || []),
      {
        status: newStatus,
        title: `Status updated to ${newStatus}`,
        description: reason || `Transitioned from ${tx.status} to ${newStatus}.`,
        timestamp: new Date().toISOString(),
        actor: 'Orchestrator Ops',
      },
    ];

    return transactionRepository.update(id, {
      status: newStatus,
      statusLabel: `${newStatus} (simulated)`,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    });
  }
}

export const transactionService = new TransactionService();
