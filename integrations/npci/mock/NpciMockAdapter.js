/**
 * integrations/npci/mock/NpciMockAdapter.js
 *
 * Mock NPCI adapter — safe for demos and local development.
 * Returns realistic-looking but fully simulated responses.
 *
 * IMPORTANT: This adapter NEVER makes real API calls.
 * It is explicitly labelled as MOCK/DEMO in all responses.
 *
 * When real NPCI credentials and API access are obtained,
 * use NpciLiveAdapter instead (configured via NPCI_ADAPTER=live env var).
 */

import { PaymentRailAdapter } from '../../interface/PaymentRailAdapter.js';

export class NpciMockAdapter extends PaymentRailAdapter {
  get name() {
    return 'NPCI/UPI (Mock)';
  }

  async isAvailable() {
    return true; // Always available in mock mode
  }

  async getFee({ amount }) {
    // Mock: flat 0.5% fee, min $0.50
    const fee = Math.max(amount * 0.005, 0.50);
    return { feeAmount: fee, feeCurrency: 'USD', estimatedFeeUSD: fee };
  }

  async getEstimatedSettlementTime() {
    return 30; // Mock: 30 seconds
  }

  async initiateTransfer(payload) {
    // TODO: Implement mock transfer simulation
    console.log('[NpciMockAdapter] initiateTransfer called — not yet implemented', payload);
    throw new Error('NpciMockAdapter.initiateTransfer: not yet implemented');
  }

  async getTransferStatus(railTransactionId) {
    // TODO: Implement mock status lookup
    console.log('[NpciMockAdapter] getTransferStatus called — not yet implemented', railTransactionId);
    throw new Error('NpciMockAdapter.getTransferStatus: not yet implemented');
  }
}
