/**
 * integrations/factory.js
 *
 * Adapter factory — resolves and returns the correct adapter instance
 * based on rail identifier and environment configuration.
 *
 * This is the ONLY place where the decision between mock/live adapters is made.
 * Business logic never needs to know which variant is active.
 */

import { NpciMockAdapter } from './npci/mock/NpciMockAdapter.js';
import { BlockchainMockAdapter } from './blockchain/BlockchainMockAdapter.js';
import { BankMockAdapter } from './bank/BankMockAdapter.js';
import { SwiftAdapter } from './swift/SwiftAdapter.js';
import { PaymentRailAdapter } from './interface/PaymentRailAdapter.js';

class DirectNpciUnavailableAdapter extends PaymentRailAdapter {
  get name() {
    return 'Direct NPCI Rail (Pending Bilateral License)';
  }
  get id() {
    return 'direct_npci';
  }
  async isAvailable() {
    return false;
  }
  get unavailableReason() {
    return 'Not connected in this demo. It will appear here when an authorized bilateral integration exists.';
  }
  async getFee() {
    return { feeAmount: 0, feeCurrency: 'INR', estimatedFeeUSD: 0, isMock: true };
  }
  async getEstimatedSettlementTime() {
    return 5;
  }
  async initiateTransfer() {
    throw new Error('Direct NPCI rail is not connected in this demo environment.');
  }
  async getTransferStatus() {
    throw new Error('Direct NPCI rail is not connected.');
  }
}

const instances = {
  npci: new NpciMockAdapter(),
  upi_partner: new NpciMockAdapter(),
  blockchain: new BlockchainMockAdapter(),
  blockchain_partner: new BlockchainMockAdapter(),
  bank: new BankMockAdapter(),
  imps_bank: new BankMockAdapter(),
  swift: new SwiftAdapter(),
  direct_npci: new DirectNpciUnavailableAdapter(),
};

/**
 * @param {string} railId
 * @returns {import('./interface/PaymentRailAdapter.js').PaymentRailAdapter}
 */
export function getAdapter(railId) {
  const adapter = instances[railId];
  if (!adapter) {
    throw new Error(`Unknown payment rail adapter: ${railId}`);
  }
  return adapter;
}

/**
 * Returns all registered rail identifiers.
 * @returns {string[]}
 */
export function getAvailableRails() {
  return Object.keys(instances);
}

/**
 * Returns all unique registered adapter instances.
 */
export function getAllAdapters() {
  return [instances.npci, instances.blockchain, instances.bank, instances.swift, instances.direct_npci];
}

/**
 * Returns status report of all registered adapters for health/diagnostics.
 */
export async function getAdaptersStatus() {
  const reports = {};
  for (const [id, adapter] of Object.entries(instances)) {
    // Only report primary keys to avoid duplicate alias noise
    if (['upi_partner', 'blockchain_partner', 'imps_bank'].includes(id)) continue;
    reports[id] = {
      name: adapter.name,
      available: await adapter.isAvailable(),
      type: id === 'direct_npci' ? 'unconnected' : 'mock',
    };
  }
  return reports;
}
