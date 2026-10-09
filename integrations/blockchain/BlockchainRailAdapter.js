/**
 * integrations/blockchain/BlockchainRailAdapter.js
 *
 * Blockchain settlement rail adapter — placeholder.
 *
 * PURPOSE (future):
 *   Execute settlement via Ethereum smart contracts (Sepolia testnet / mainnet).
 *   Uses ethers.js to interact with deployed SettlementRecord / Escrow contracts.
 *
 * NOTE:
 *   Blockchain is used for settlement RECORDS and VERIFICATION, NOT as a
 *   replacement for banking infrastructure. This adapter records the outcome
 *   of a settlement on-chain after the off-chain transfer is complete.
 *
 * STATUS: Not yet implemented.
 */

import { PaymentRailAdapter } from '../interface/PaymentRailAdapter.js';

export class BlockchainRailAdapter extends PaymentRailAdapter {
  get name() {
    return 'Ethereum Blockchain Settlement';
  }

  async isAvailable() {
    throw new Error('BlockchainRailAdapter: not yet implemented');
  }

  async getFee(_params) {
    // Will calculate gas cost estimate in USD
    throw new Error('BlockchainRailAdapter: not yet implemented');
  }

  async getEstimatedSettlementTime(_params) {
    throw new Error('BlockchainRailAdapter: not yet implemented');
  }

  async initiateTransfer(_payload) {
    throw new Error('BlockchainRailAdapter: not yet implemented');
  }

  async getTransferStatus(_railTransactionId) {
    throw new Error('BlockchainRailAdapter: not yet implemented');
  }
}
