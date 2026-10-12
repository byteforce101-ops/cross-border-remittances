/**
 * integrations/bank/BankMockAdapter.js
 *
 * Mock Correspondent Banking / IMPS Adapter.
 */

import { PaymentRailAdapter } from '../interface/PaymentRailAdapter.js';

export class BankMockAdapter extends PaymentRailAdapter {
  get name() {
    return 'IMPS / Correspondent Banking (Simulated)';
  }

  get id() {
    return 'bank';
  }

  async isAvailable() {
    return true;
  }

  async getFee({ amount = 1000, fromCurrency = 'AED' }) {
    const feeAmount = fromCurrency === 'AED' ? 18.00 : fromCurrency === 'USD' ? 5.00 : 4.00;
    return {
      feeAmount,
      feeCurrency: fromCurrency,
      estimatedFeeUSD: 5.00,
      isMock: true,
    };
  }

  async getEstimatedSettlementTime() {
    return 3600; // ~1 hour
  }

  async initiateTransfer(payload) {
    const timestamp = Date.now();
    const suffix = Math.random().toString(36).substring(2, 8);
    const railTransactionId = `sim_bank_${timestamp}_${suffix}`;

    return {
      railTransactionId,
      status: 'PROCESSING',
      providerReference: `CORRESP-BANK-SIM-${timestamp.toString().slice(-6)}`,
      estimatedSettlementSeconds: 3600,
      metadata: {
        rail: 'bank',
        clearingNetwork: 'IMPS via Partner Nostro/Vostro Account',
        recipientBank: payload.recipientBank || payload.recipient?.bankName || 'Correspondent Bank',
        isMock: true,
        initiatedAt: new Date().toISOString(),
      },
    };
  }

  async getTransferStatus(railTransactionId) {
    return {
      railTransactionId,
      status: 'COMPLETED',
      metadata: {
        rail: 'bank',
        utrNumber: `SIMUTR${Date.now().toString().slice(-8)}`,
        isMock: true,
        settledAt: new Date().toISOString(),
      },
    };
  }
}
