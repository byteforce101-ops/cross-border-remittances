/**
 * client/src/services/transactionService.js
 *
 * Transaction service connecting directly to the backend RemittanceOS API.
 * The server is the single source of truth for transaction creation, fee calculations,
 * and state transitions.
 */

import { apiClient } from './apiClient.js';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';

export const transactionService = {
  /**
   * Creates a transaction on the server with idempotency protection.
   */
  async createTransaction(payload, idempotencyKey = null) {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiClient.post('/transactions', payload, { headers });
  },

  /**
   * Fetches all transactions from the server.
   */
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.route && filters.route !== 'all') params.append('route', filters.route);
    if (filters.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/transactions${qs}`);
  },

  /**
   * Fetches a single transaction by ID.
   */
  async getTransactionById(id) {
    return apiClient.get(`/transactions/${id}`);
  },

  /**
   * Advances status through the server-side state machine.
   */
  async updateStatus(id, status, reason = null) {
    return apiClient.post(`/transactions/${id}/status`, { status, reason });
  },

  generateId(existingTransactions = []) {
    let maxNum = 42;
    for (const t of existingTransactions) {
      if (t.id && t.id.startsWith('TXN-D-')) {
        const n = parseInt(t.id.replace('TXN-D-', ''), 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `TXN-D-${String(nextNum).padStart(4, '0')}`;
  },

  buildTransaction({
    existingTransactions = [],
    amount,
    fromCurrency = 'AED',
    recipient,
    purpose = 'Family support',
    route,
    calc,
  }) {
    const id = this.generateId(existingTransactions);
    const now = new Date();

    return {
      id,
      date: now.toISOString(),
      senderName: 'Arjun Patel',
      senderCountry: 'United Arab Emirates',
      senderCountryCode: 'AE',
      senderCurrency: fromCurrency,
      recipientName: recipient.name,
      recipientUpi: recipient.upiId,
      recipientBank: recipient.bankName || 'Axis Bank',
      fromAmount: parseFloat(amount),
      fromCurrency,
      toAmount: calc.recipientINR,
      toCurrency: 'INR',
      fxRate: calc.appliedRate,
      midMarketRate: calc.midRate,
      transferFee: calc.feeAED,
      fxFee: calc.fxCostAED,
      totalFee: calc.totalCostAED,
      route: route.id,
      routeName: route.name,
      routeShort: route.shortName,
      status: TRANSACTION_STATUS.PROCESSING,
      statusLabel: 'Processing (simulated)',
      purpose,
      settlementTime: null,
      settlementTimeLabel: route.eta,
      blockchainTxHash: route.id === 'blockchain_partner' ? 'sim_sepolia_ref_' + Date.now().toString(36) : null,
      riskScore: 12,
      riskLevel: 'LOW',
      note: `Simulated transfer initiated via ${route.name}. Safe hackathon prototype.`,
      timeline: [
        {
          title: 'Transfer created',
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detail: 'quote and route locked',
          status: 'done',
        },
        {
          title: 'Checks passed (simulated)',
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detail: 'Amount & corridor verification complete',
          status: 'done',
        },
        {
          title: `Routing to ${route.shortName} rail`,
          time: 'Now',
          detail: `Usually ${route.eta}.`,
          status: 'now',
        },
        {
          title: 'Settlement & delivery to recipient',
          time: 'Next',
          detail: 'Crediting recipient bank account',
          status: 'next',
        },
      ],
    };
  },
};
