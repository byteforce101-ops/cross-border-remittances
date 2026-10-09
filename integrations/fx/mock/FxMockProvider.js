/**
 * integrations/fx/mock/FxMockProvider.js
 *
 * Mock FX rate provider — uses static seeded rates.
 * Safe for demos, CI, and local development without an FX API key.
 *
 * STATUS: Partially ready — rates are hardcoded stubs.
 *         Will be expanded with more currencies as needed.
 */

// Hardcoded indicative rates: 1 USD = X target currency
const MOCK_RATES = {
  INR: 83.5,
  AED: 3.67,
  GBP: 0.79,
  EUR: 0.92,
  SGD: 1.35,
  USD: 1.0,
};

export class FxMockProvider {
  /**
   * Get exchange rate from USD to target currency.
   * @param {string} toCurrency
   * @returns {Promise<number>}
   */
  async getRate(toCurrency) {
    const rate = MOCK_RATES[toCurrency.toUpperCase()];
    if (!rate) throw new Error(`FxMockProvider: unsupported currency ${toCurrency}`);
    return rate;
  }

  /**
   * Convert an amount from fromCurrency to toCurrency.
   * @param {{ amount: number, fromCurrency: string, toCurrency: string }} params
   * @returns {Promise<{ convertedAmount: number, rate: number, isMock: true }>}
   */
  async convert({ amount, fromCurrency, toCurrency }) {
    // Simple USD-pivot conversion
    const fromRate = MOCK_RATES[fromCurrency.toUpperCase()];
    const toRate = MOCK_RATES[toCurrency.toUpperCase()];
    if (!fromRate) throw new Error(`FxMockProvider: unsupported fromCurrency ${fromCurrency}`);
    if (!toRate) throw new Error(`FxMockProvider: unsupported toCurrency ${toCurrency}`);
    const amountInUsd = amount / fromRate;
    const convertedAmount = amountInUsd * toRate;
    return { convertedAmount, rate: toRate / fromRate, isMock: true };
  }
}
