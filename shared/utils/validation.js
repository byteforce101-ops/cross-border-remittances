/**
 * shared/utils/validation.js
 *
 * Shared validation helpers — used by server (Zod schemas) and client forms.
 * Pure functions. No external dependencies.
 */

/**
 * Validate a UPI ID format (basic regex check).
 * @param {string} upiId
 * @returns {boolean}
 */
export function isValidUpiId(upiId) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
}

/**
 * Validate an IFSC code format (Indian bank branch code).
 * @param {string} ifsc
 * @returns {boolean}
 */
export function isValidIfsc(ifsc) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

/**
 * Validate a positive non-zero transfer amount.
 * @param {number} amount
 * @returns {boolean}
 */
export function isValidAmount(amount) {
  return typeof amount === 'number' && isFinite(amount) && amount > 0;
}
