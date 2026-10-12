/**
 * server/src/services/transactionService.js
 *
 * Server-side transaction orchestration service.
 * Handles validation, server-side recalculation of quotes and fees,
 * pre-execution risk checks, adapter dispatch, and controlled status lifecycle.
 */

import { transactionRepository } from '../repositories/TransactionRepository.js';
import { idempotencyRepository } from '../repositories/IdempotencyRepository.js';
import { recipientRepository } from '../repositories/RecipientRepository.js';
import { fxService } from './fxService.js';
import { riskService } from './riskService.js';
import { getAdapter } from '../../../integrations/factory.js';
import { TRANSACTION_STATUS, TERMINAL_STATUSES } from '../../../shared/constants/transactionStatus.js';

// State transition graph
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
   * Creates a transaction with idempotency protection and server-side verification.
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
    } = payload;

    // 2. Resolve recipient
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

    // 3. Validate and recalculate FX quote server-side (server is source of truth!)
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Amount must be a positive number.');
    }

    const quote = fxService.calculateQuote({
      fromAmount: numericAmount,
      fromCurrency,
      routeId,
    });

    // 4. Resolve payment adapter & verify rail availability
    let adapterKey = 'npci';
    if (routeId === 'imps_bank' || routeId === 'bank') adapterKey = 'bank';
    else if (routeId === 'blockchain_partner' || routeId === 'blockchain') adapterKey = 'blockchain';
    else if (routeId === 'swift') adapterKey = 'swift';
    else if (routeId === 'direct_npci') adapterKey = 'direct_npci';

    const adapter = getAdapter(adapterKey);
    const available = await adapter.isAvailable();
    if (!available) {
      throw new Error(`The selected payment rail "${adapter.name}" is unavailable for execution in this environment.`);
    }

    // 5. Pre-execution Risk Analysis (server-side)
    const riskAssessment = riskService.evaluate({
      fromAmount: numericAmount,
      fromCurrency,
      recipientUpi: resolvedRecipient.upiId,
      recipientName: resolvedRecipient.name,
      purpose,
      corridor: `${senderCountryCode}_INR`,
    });

    // Initial status determined by risk
    let initialStatus = TRANSACTION_STATUS.PROCESSING;
    let initialStatusLabel = 'Processing (simulated)';
    if (riskAssessment.requiresManualReview) {
      initialStatus = TRANSACTION_STATUS.COMPLIANCE_REVIEW;
      initialStatusLabel = 'Under Compliance Review (simulated)';
    }

    // 6. Simulate adapter initiation
    const transferInitiation = await adapter.initiateTransfer({
      amount: numericAmount,
      fromCurrency,
      recipient: resolvedRecipient,
      purpose,
      recipientUpi: resolvedRecipient.upiId,
      recipientBank: resolvedRecipient.bankName,
    });

    // 7. Generate Transaction ID and Build Record
    const txId = await transactionRepository.getNextId();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initialTimeline = [
      {
        title: 'Transfer created',
        time: timeFormatted,
        detail: `Quote locked: 1 ${fromCurrency} = ₹${quote.appliedRate}`,
        status: 'done',
      },
      {
        title: 'Pre-flight checks passed (simulated)',
        time: timeFormatted,
        detail: `Risk Score: ${riskAssessment.score}/100 (${riskAssessment.level})`,
        status: 'done',
      },
      {
        title: `Routed to ${adapter.name}`,
        time: 'Now',
        detail: `Provider Ref: ${transferInitiation.providerReference}`,
        status: initialStatus === TRANSACTION_STATUS.PROCESSING ? 'now' : 'done',
      },
      {
        title: 'Settlement & delivery to recipient',
        time: 'Next',
        detail: `Estimated delivery to ${resolvedRecipient.bankName || 'beneficiary account'} via ${resolvedRecipient.upiId}`,
        status: 'next',
      },
    ];

    const transactionRecord = {
      id: txId,
      date: now.toISOString(),
      senderName,
      senderCountry,
      senderCountryCode,
      senderCurrency: fromCurrency,
      recipientName: resolvedRecipient.name,
      recipientUpi: resolvedRecipient.upiId,
      recipientBank: resolvedRecipient.bankName || 'Axis Bank',
      fromAmount: quote.fromAmount,
      fromCurrency: quote.fromCurrency,
      toAmount: quote.recipientINR,
      toCurrency: 'INR',
      fxRate: quote.appliedRate,
      midMarketRate: quote.midRate,
      transferFee: quote.feeAmount,
      fxFee: quote.fxCost,
      totalFee: quote.totalCost,
      feeCurrency: quote.feeCurrency,
      route: routeId,
      routeName: adapter.name,
      routeShort: routeId === 'upi_partner' ? 'UPI-linked' : routeId === 'imps_bank' ? 'IMPS' : routeId === 'blockchain_partner' ? 'Blockchain' : 'Direct',
      status: initialStatus,
      statusLabel: initialStatusLabel,
      purpose,
      settlementTime: null,
      settlementTimeLabel: `${Math.round(transferInitiation.estimatedSettlementSeconds / 60)} min (est)`,
      // Clear simulated provider reference, never fake genuine mainnet hashes
      railTransactionId: transferInitiation.railTransactionId,
      providerReference: transferInitiation.providerReference,
      blockchainTxHash: routeId.includes('blockchain') ? transferInitiation.railTransactionId : null,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      requiresManualReview: riskAssessment.requiresManualReview,
      isSimulated: true,
      note: `Simulated transfer initiated via ${adapter.name}. Safe hackathon prototype.`,
      timeline: initialTimeline,
      metadata: transferInitiation.metadata,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 8. Persist to repository
    const saved = await transactionRepository.create(transactionRecord);

    // 9. Update recipient transfer totals if existing recipient
    if (resolvedRecipient.id) {
      const rec = await recipientRepository.findById(resolvedRecipient.id);
      if (rec) {
        await recipientRepository.update(resolvedRecipient.id, {
          totalTransfers: (rec.totalTransfers || 0) + 1,
          totalVolumeINR: (rec.totalVolumeINR || 0) + quote.recipientINR,
          lastTransfer: 'Just now',
        });
      }
    }

    // 10. Cache in idempotency repository
    if (idempotencyKey) {
      await idempotencyRepository.save(idempotencyKey, saved);
    }

    return saved;
  }

  async getTransactions(filters = {}) {
    return transactionRepository.findAll(filters);
  }

  async getTransactionById(id) {
    const tx = await transactionRepository.findById(id);
    if (!tx) {
      throw new Error(`Transaction with ID "${id}" was not found.`);
    }
    return tx;
  }

  /**
   * Controlled status transition validation
   */
  async updateStatus(id, newStatus, reason = null) {
    const tx = await this.getTransactionById(id);
    const currentStatus = tx.status;

    if (currentStatus === newStatus) {
      return tx; // No-op
    }

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed next statuses: ${allowed.join(', ') || 'None (Terminal state)'}`);
    }

    const updates = {
      status: newStatus,
      statusLabel: `${newStatus.replace(/_/g, ' ')} (simulated)`,
    };

    if (newStatus === TRANSACTION_STATUS.COMPLETED) {
      updates.settlementTime = tx.route.includes('npci') ? 30 : tx.route.includes('blockchain') ? 15 : 120;
      updates.settlementTimeLabel = `${updates.settlementTime}s`;
      // Update timeline
      const updatedTimeline = [...(tx.timeline || [])];
      updatedTimeline.push({
        title: 'Settlement confirmed (simulated)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detail: `₹${tx.toAmount.toLocaleString()} credited to recipient account`,
        status: 'done',
      });
      updates.timeline = updatedTimeline;
    }

    if (reason) {
      updates.statusReason = reason;
    }

    return transactionRepository.update(id, updates);
  }
}

export const transactionService = new TransactionService();
