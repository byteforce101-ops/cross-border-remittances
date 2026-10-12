/**
 * integrations/npci/mock/NpciMockAdapter.js
 *
 * Mock NPCI adapter — safe for demos and local development.
 * Returns realistic-looking but fully simulated responses.
 *
 * IMPORTANT: This adapter NEVER makes real API calls.
 * It is explicitly labelled as MOCK/DEMO in all responses.
 */

import { PaymentRailAdapter } from '../../interface/PaymentRailAdapter.js';

export class NpciMockAdapter extends PaymentRailAdapter {
  get name() {
    return 'NPCI / UPI (Simulated)';
  }

  get id() {
    return 'npci';
  }

  async isAvailable() {
    return true; // Always available in mock mode
  }

  async getFee({ amount = 1000, fromCurrency = 'AED' }) {
    // 0.5% fee with min 1 unit of fromCurrency
    const feeAmount = Math.max(parseFloat((amount * 0.005).toFixed(2)), 1.00);
    return {
      feeAmount,
      feeCurrency: fromCurrency,
      estimatedFeeUSD: parseFloat((feeAmount * (fromCurrency === 'AED' ? 0.27 : 1)).toFixed(2)),
      isMock: true,
    };
  }

  async estimateFee(amount = 1000, fromCurrency = 'AED') {
    const fee = await this.getFee({ amount, fromCurrency });
    return fee.feeAmount;
  }

  async getEstimatedSettlementTime() {
    return 30; // 30 seconds
  }

  async estimateSettlementTime() {
    const secs = await this.getEstimatedSettlementTime();
    return { estimatedSeconds: secs };
  }

  async initiateTransfer(payload) {
    const timestamp = Date.now();
    const suffix = Math.random().toString(36).substring(2, 8);
    const railTransactionId = `sim_npci_${timestamp}_${suffix}`;
    const vpa = payload.recipientUpi || payload.recipient?.upiId || 'demo.user@npci';

    return {
      railTransactionId,
      status: 'PROCESSING',
      providerReference: `NPCI-SIM-${timestamp.toString().slice(-6)}`,
      estimatedSettlementSeconds: 30,
      metadata: {
        rail: 'npci',
        mode: 'SIMULATION',
        provider: 'NPCI UPI Partner Switch',
        recipientVpa: vpa,
        clearingNetwork: 'UPI (National Payments Corporation of India Mock)',
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
        rail: 'npci',
        mode: 'SIMULATION',
        providerReference: `NPCI-SIM-CONF-${railTransactionId.slice(-6)}`,
        settledAt: new Date().toISOString(),
        isMock: true,
      },
    };
  }
}
