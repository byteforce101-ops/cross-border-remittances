/**
 * integrations/swift/SwiftAdapter.js
 *
 * SWIFT / Correspondent Banking rail adapter — Mock implementation.
 */

import { PaymentRailAdapter } from '../interface/PaymentRailAdapter.js';

export class SwiftAdapter extends PaymentRailAdapter {
  get name() {
    return 'SWIFT Network (Simulated)';
  }

  get id() {
    return 'swift';
  }

  async isAvailable() {
    return true;
  }

  async getFee({ amount = 1000, fromCurrency = 'AED' }) {
    const feeAmount = fromCurrency === 'AED' ? 45.00 : fromCurrency === 'USD' ? 15.00 : 12.00;
    return {
      feeAmount,
      feeCurrency: fromCurrency,
      estimatedFeeUSD: 15.00,
      isMock: true,
    };
  }

  async getEstimatedSettlementTime() {
    return 86400 * 2; // ~2 business days
  }

  async initiateTransfer(payload) {
    const timestamp = Date.now();
    const suffix = Math.random().toString(36).substring(2, 8);
    const railTransactionId = `sim_swift_${timestamp}_${suffix}`;

    return {
      railTransactionId,
      status: 'PROCESSING',
      providerReference: `SWIFT-SIM-${timestamp.toString().slice(-8)}`,
      estimatedSettlementSeconds: 86400 * 2,
      metadata: {
        rail: 'swift',
        mt103Reference: `SIM103${timestamp.toString().slice(-6)}`,
        intermediaryBanks: 2,
        isMock: true,
        initiatedAt: new Date().toISOString(),
      },
    };
  }

  async getTransferStatus(railTransactionId) {
    return {
      railTransactionId,
      status: 'PROCESSING',
      metadata: {
        rail: 'swift',
        currentHop: 'Intermediary Correspondent Nostro',
        isMock: true,
      },
    };
  }
}
