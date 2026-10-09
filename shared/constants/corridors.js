/**
 * shared/constants/corridors.js
 *
 * Supported remittance corridors (source country → India).
 *
 * Each corridor defines:
 *   - id: machine-readable identifier
 *   - fromCountry / fromCurrency: sending side
 *   - toCountry / toCurrency: always India / INR
 *   - supportedRails: which payment rails are available for this corridor
 *   - riskTier: baseline regulatory risk tier for this corridor
 */

export const CORRIDORS = [
  {
    id: 'UAE_INR',
    fromCountry: 'United Arab Emirates',
    fromCurrency: 'AED',
    toCountry: 'India',
    toCurrency: 'INR',
    supportedRails: ['npci', 'swift', 'blockchain'],
    riskTier: 'LOW',
  },
  {
    id: 'US_INR',
    fromCountry: 'United States',
    fromCurrency: 'USD',
    toCountry: 'India',
    toCurrency: 'INR',
    supportedRails: ['npci', 'swift', 'blockchain'],
    riskTier: 'LOW',
  },
  {
    id: 'UK_INR',
    fromCountry: 'United Kingdom',
    fromCurrency: 'GBP',
    toCountry: 'India',
    toCurrency: 'INR',
    supportedRails: ['npci', 'swift'],
    riskTier: 'LOW',
  },
  {
    id: 'SG_INR',
    fromCountry: 'Singapore',
    fromCurrency: 'SGD',
    toCountry: 'India',
    toCurrency: 'INR',
    supportedRails: ['npci', 'swift'],
    riskTier: 'LOW',
  },
];

export const SUPPORTED_CURRENCIES = [...new Set(CORRIDORS.flatMap(c => [c.fromCurrency, c.toCurrency]))];
