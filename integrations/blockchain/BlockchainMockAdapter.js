/**
 * integrations/blockchain/BlockchainMockAdapter.js
 *
 * Mock Blockchain settlement adapter — simulated Ethereum Sepolia testnet execution.
 *
 * Explicitly returns simulated references with disclaimer.
 * NEVER creates fake 0x transaction hashes and presents them as genuine mainnet transactions.
 */

import { PaymentRailAdapter } from '../interface/PaymentRailAdapter.js';

export class BlockchainMockAdapter extends PaymentRailAdapter {
  get name() {
    return 'Blockchain Settlement (Sepolia Testnet Simulated)';
  }

  get id() {
    return 'blockchain';
  }

  async isAvailable() {
    return true; // Available on Sepolia testnet in demo
  }

  async getFee({ amount = 1000, fromCurrency = 'AED' }) {
    // Fixed low network gas fee in sender currency
    const feeAmount = fromCurrency === 'AED' ? 9.00 : fromCurrency === 'USD' ? 2.50 : 2.00;
    return {
      feeAmount,
      feeCurrency: fromCurrency,
      estimatedFeeUSD: 2.50,
      isMock: true,
      gasEstimateGwei: 25,
    };
  }

  async getEstimatedSettlementTime() {
    return 600; // ~10 minutes
  }

  async initiateTransfer(payload) {
    const timestamp = Date.now();
    const suffix = Math.random().toString(36).substring(2, 8);
    // Explicitly identify as a simulated reference
    const railTransactionId = `sim_sepolia_ref_${timestamp}_${suffix}`;

    return {
      railTransactionId,
      status: 'PROCESSING',
      providerReference: `SEPOLIA-SIM-AUDIT-${timestamp.toString().slice(-6)}`,
      estimatedSettlementSeconds: 600,
      metadata: {
        rail: 'blockchain',
        network: 'Ethereum Sepolia Testnet (Simulated)',
        contractAddress: '0x0000000000000000000000000000000000000000 (Mock Escrow/Audit)',
        auditTrailNote: 'Simulated on-chain audit trail entry created for testnet verification.',
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
        rail: 'blockchain',
        network: 'Ethereum Sepolia Testnet (Simulated)',
        confirmations: 12,
        isMock: true,
        settledAt: new Date().toISOString(),
      },
    };
  }
}
