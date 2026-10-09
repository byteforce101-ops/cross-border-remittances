/**
 * integrations/interface/PaymentRailAdapter.js
 *
 * Abstract interface (JSDoc contract) that every payment rail adapter MUST implement.
 * No logic here — just documentation of the expected method signatures.
 *
 * This pattern allows the route optimizer and transaction service to work with
 * any rail without caring about implementation details.
 */

/**
 * @interface PaymentRailAdapter
 */
export class PaymentRailAdapter {
  /**
   * Returns a human-readable identifier for this rail.
   * @returns {string}
   */
  get name() {
    throw new Error('Not implemented');
  }

  /**
   * Check whether this rail is currently available / reachable.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('Not implemented');
  }

  /**
   * Get the estimated fee for a given transfer.
   * @param {{ amount: number, fromCurrency: string, toCurrency: string }} params
   * @returns {Promise<{ feeAmount: number, feeCurrency: string, estimatedFeeUSD: number }>}
   */
  async getFee(_params) {
    throw new Error('Not implemented');
  }

  /**
   * Get the estimated settlement time in seconds.
   * @param {{ amount: number, fromCurrency: string, toCurrency: string }} params
   * @returns {Promise<number>}
   */
  async getEstimatedSettlementTime(_params) {
    throw new Error('Not implemented');
  }

  /**
   * Initiate a transfer on this rail.
   * @param {object} transferPayload
   * @returns {Promise<{ railTransactionId: string, status: string, metadata: object }>}
   */
  async initiateTransfer(_transferPayload) {
    throw new Error('Not implemented');
  }

  /**
   * Query the status of a previously initiated transfer.
   * @param {string} railTransactionId
   * @returns {Promise<{ status: string, metadata: object }>}
   */
  async getTransferStatus(_railTransactionId) {
    throw new Error('Not implemented');
  }
}
