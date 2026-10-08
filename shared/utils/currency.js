/**
 * shared/utils/currency.js
 *
 * Shared currency utility functions — used by both server and client.
 * No external dependencies. Pure functions only.
 */

/**
 * Format a number as a currency string.
 * @param {number} amount
 * @param {string} currency  — ISO 4217 code (e.g. 'USD', 'INR')
 * @param {string} [locale]  — BCP 47 locale (default: 'en-IN' for India context)
 * @returns {string}
 */
export function formatCurrency(amount, currency, locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Round to a given number of decimal places (avoids floating-point drift).
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {number}
 */
export function roundTo(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
