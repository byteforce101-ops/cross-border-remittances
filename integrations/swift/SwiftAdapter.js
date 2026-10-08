/**
 * integrations/swift/SwiftAdapter.js
 *
 * SWIFT / Correspondent Banking rail adapter — placeholder.
 *
 * PURPOSE (future):
 *   Handle transfers routed via the traditional SWIFT interbank network.
 *   Typically used for high-value, cross-currency, bank-to-bank transfers.
 *
 * STATUS: Not yet implemented.
 */

import { PaymentRailAdapter } from '../interface/PaymentRailAdapter.js';

export class SwiftAdapter extends PaymentRailAdapter {
  get name() {
    return 'SWIFT / Correspondent Banking';
  }

  async isAvailable() {
    throw new Error('SwiftAdapter: not yet implemented');
  }

  async getFee(_params) {
    throw new Error('SwiftAdapter: not yet implemented');
  }

  async getEstimatedSettlementTime(_params) {
    throw new Error('SwiftAdapter: not yet implemented');
  }

  async initiateTransfer(_payload) {
    throw new Error('SwiftAdapter: not yet implemented');
  }

  async getTransferStatus(_railTransactionId) {
    throw new Error('SwiftAdapter: not yet implemented');
  }
}
