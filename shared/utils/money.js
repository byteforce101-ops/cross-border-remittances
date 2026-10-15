/**
 * shared/utils/money.js
 *
 * Decimal-safe monetary arithmetic for financial calculations.
 * Avoids IEEE 754 floating-point rounding errors (e.g., 0.1 + 0.2 = 0.30000000000000004).
 * Works using integer minor units (cents/fils/paise) and scaled basis points.
 */

/**
 * Rounds a number to a fixed number of decimal places reliably.
 * @param {number|string} value
 * @param {number} decimals
 * @returns {number}
 */
export function roundTo(value, decimals = 2) {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Converts a major currency unit to minor units (e.g., 100.50 AED -> 10050 fils).
 * @param {number|string} amount
 * @param {number} decimals
 * @returns {number}
 */
export function toMinorUnits(amount, decimals = 2) {
  return Math.round(Number(amount) * Math.pow(10, decimals));
}

/**
 * Converts minor units back to major currency unit (e.g., 10050 fils -> 100.50 AED).
 * @param {number} minorUnits
 * @param {number} decimals
 * @returns {number}
 */
export function fromMinorUnits(minorUnits, decimals = 2) {
  return roundTo(minorUnits / Math.pow(10, decimals), decimals);
}

/**
 * Calculates percentage fee with safe rounding.
 * @param {number} principal
 * @param {number} percentage (e.g., 0.5 for 0.5%)
 * @returns {number}
 */
export function calculatePercentageFee(principal, percentage) {
  const principalMinor = toMinorUnits(principal, 2);
  const feeMinor = Math.round(principalMinor * (percentage / 100));
  return fromMinorUnits(feeMinor, 2);
}

/**
 * Decomposes an FX conversion into net received, spread cost, and effective rate.
 *
 * @param {Object} params
 * @param {number} params.sendAmount - Principal amount sent in source currency
 * @param {number} params.fixedFee - Fixed rail fee in source currency
 * @param {number} params.midMarketRate - Unbiased benchmark exchange rate
 * @param {number} params.appliedRate - Actual rate delivered after spread
 * @param {boolean} [params.deductFeeFromPrincipal=true] - Whether fee is subtracted from send amount
 * @returns {Object} Safe monetary breakdown
 */
export function calculateRemittanceEconomics({
  sendAmount,
  fixedFee,
  midMarketRate,
  appliedRate,
  deductFeeFromPrincipal = true,
}) {
  const safeSend = roundTo(sendAmount, 2);
  const safeFee = roundTo(fixedFee, 2);
  const safeMid = roundTo(midMarketRate, 4);
  const safeApplied = roundTo(appliedRate, 4);

  // Converted principal
  const convertedPrincipal = deductFeeFromPrincipal
    ? Math.max(0, roundTo(safeSend - safeFee, 2))
    : safeSend;

  // Recipient amount in destination currency (INR)
  const recipientAmount = roundTo(convertedPrincipal * safeApplied, 2);

  // FX Spread Cost in source currency (the hidden cost of rate markup)
  // Spread = convertedPrincipal * ((midRate - appliedRate) / midRate)
  const spreadDiff = Math.max(0, safeMid - safeApplied);
  const fxSpreadCost = safeMid > 0
    ? roundTo(convertedPrincipal * (spreadDiff / safeMid), 2)
    : 0;

  // Total economic cost to sender in source currency
  const totalCost = roundTo(safeFee + fxSpreadCost, 2);
  const totalCostPct = safeSend > 0 ? roundTo((totalCost / safeSend) * 100, 2) : 0;
  const fxSpreadPct = safeMid > 0 ? roundTo((spreadDiff / safeMid) * 100, 2) : 0;

  // Effective rate = recipient INR / total outlay
  const totalOutlay = deductFeeFromPrincipal ? safeSend : roundTo(safeSend + safeFee, 2);
  const effectiveRate = totalOutlay > 0 ? roundTo(recipientAmount / totalOutlay, 4) : safeApplied;

  return {
    sendAmount: safeSend,
    fixedFee: safeFee,
    convertedPrincipal,
    recipientAmount,
    midMarketRate: safeMid,
    appliedRate: safeApplied,
    fxSpreadCost,
    fxSpreadPct,
    totalCost,
    totalCostPct,
    effectiveRate,
    totalOutlay,
  };
}
