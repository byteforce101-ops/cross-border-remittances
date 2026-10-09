/**
 * integrations/npci/live/NpciLiveAdapter.js
 *
 * Live NPCI adapter — connects to actual NPCI/UPI APIs.
 *
 * STATUS: Not yet implemented. Requires:
 *   - NPCI API credentials (NPCI_API_KEY)
 *   - NPCI API base URL (NPCI_API_BASE_URL)
 *   - Approved API access from NPCI / Citi partnership
 *
 * This file exists to define WHERE real NPCI integration will live.
 * No real API calls are made until this class is fully implemented
 * AND the NPCI_ADAPTER env var is set to 'live'.
 */

import { PaymentRailAdapter } from '../../interface/PaymentRailAdapter.js';

export class NpciLiveAdapter extends PaymentRailAdapter {
  get name() {
    return 'NPCI/UPI (Live)';
  }

  async isAvailable() {
    // TODO: Ping NPCI health endpoint
    throw new Error('NpciLiveAdapter: not yet implemented');
  }

  async getFee(_params) {
    // TODO: Call NPCI fee estimation API
    throw new Error('NpciLiveAdapter: not yet implemented');
  }

  async getEstimatedSettlementTime(_params) {
    // TODO: Call NPCI settlement time API
    throw new Error('NpciLiveAdapter: not yet implemented');
  }

  async initiateTransfer(_payload) {
    // TODO: Call NPCI transfer initiation API
    throw new Error('NpciLiveAdapter: not yet implemented');
  }

  async getTransferStatus(_railTransactionId) {
    // TODO: Call NPCI transfer status API
    throw new Error('NpciLiveAdapter: not yet implemented');
  }
}
