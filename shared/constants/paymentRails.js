/**
 * shared/constants/paymentRails.js
 *
 * Payment rail registry — identifiers and human-readable metadata.
 * Used by the route optimizer and UI to reference rails consistently.
 */

export const PAYMENT_RAILS = Object.freeze({
  NPCI: {
    id: 'npci',
    displayName: 'NPCI / UPI',
    description: 'National Payments Corporation of India — UPI-based settlement',
    typicalSpeedSeconds: 30,
    typicalFeePercent: 0.5,
    availableIn: ['UAE_INR', 'US_INR', 'UK_INR', 'SG_INR'],
  },
  SWIFT: {
    id: 'swift',
    displayName: 'SWIFT / Correspondent Banking',
    description: 'Traditional interbank wire transfer via SWIFT network',
    typicalSpeedSeconds: 86400 * 2, // ~2 business days
    typicalFeePercent: 1.5,
    availableIn: ['UAE_INR', 'US_INR', 'UK_INR', 'SG_INR'],
  },
  BLOCKCHAIN: {
    id: 'blockchain',
    displayName: 'Blockchain Settlement',
    description: 'Ethereum-based smart contract settlement with on-chain audit trail',
    typicalSpeedSeconds: 60,
    typicalFeePercent: 0.8, // includes gas cost estimate
    availableIn: ['UAE_INR', 'US_INR'],
  },
});
