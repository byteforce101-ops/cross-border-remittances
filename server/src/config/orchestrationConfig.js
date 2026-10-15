/**
 * server/src/config/orchestrationConfig.js
 *
 * Single Source of Truth for:
 * - Corridors and currency pairs
 * - Payment rail parameters, fees, and regulatory availability
 * - Multi-criteria routing weights
 * - Risk thresholds and sanctions parameters
 * - Data provenance classifications
 */

export const DATA_PROVENANCE = Object.freeze({
  LIVE_PROVIDER: 'LIVE_PROVIDER',             // Live API response retrieved within cache window
  PUBLIC_REFERENCE: 'PUBLIC_REFERENCE',       // Official public benchmark (e.g. ECB reference rate)
  CONFIGURED_ESTIMATE: 'CONFIGURED_ESTIMATE', // Formally configured partner tier or fee matrix
  SYNTHETIC: 'SYNTHETIC',                     // Simulated historical records for repeatable testing
  MOCK: 'MOCK',                               // Mock adapter executing simulated state machine
  TESTNET: 'TESTNET',                         // Verified on Ethereum Sepolia or testnet
  UNAVAILABLE: 'UNAVAILABLE',                 // Disclosed as unavailable (e.g. direct NPCI)
});

export const ROUTING_WEIGHTS = {
  DEFAULT: {
    cost: 0.35,        // Economic efficiency (lower total fee + spread is better)
    speed: 0.30,       // Settlement turnaround (faster SLA is better)
    reliability: 0.25, // Historical delivery rate (higher is better)
    risk: 0.10,        // Operational & regulatory risk tier (lower risk is better)
  },
  CHEAPEST: {
    cost: 0.85,
    speed: 0.05,
    reliability: 0.05,
    risk: 0.05,
  },
  FASTEST: {
    cost: 0.15,
    speed: 0.65,
    reliability: 0.15,
    risk: 0.05,
  },
  RELIABLE: {
    cost: 0.15,
    speed: 0.15,
    reliability: 0.60,
    risk: 0.10,
  },
};

export const CORRIDOR_CONFIG = {
  UAE_INR: {
    id: 'UAE_INR',
    sourceCountry: 'United Arab Emirates',
    sourceCountryCode: 'AE',
    sourceCurrency: 'AED',
    destinationCountry: 'India',
    destinationCountryCode: 'IN',
    destinationCurrency: 'INR',
    minAmount: 50,
    maxAmount: 25000,
    defaultMidMarketRate: 24.12,
    baseFee: 12.00,
    quoteValiditySeconds: 45,
    supportedRails: ['upi_partner', 'imps_bank', 'blockchain_partner', 'swift'],
    regulatoryTier: 'LOW',
  },
  US_INR: {
    id: 'US_INR',
    sourceCountry: 'United States',
    sourceCountryCode: 'US',
    sourceCurrency: 'USD',
    destinationCountry: 'India',
    destinationCountryCode: 'IN',
    destinationCurrency: 'INR',
    minAmount: 20,
    maxAmount: 15000,
    defaultMidMarketRate: 83.95,
    baseFee: 3.50,
    quoteValiditySeconds: 45,
    supportedRails: ['imps_bank', 'swift', 'blockchain_partner'],
    regulatoryTier: 'LOW',
  },
  UK_INR: {
    id: 'UK_INR',
    sourceCountry: 'United Kingdom',
    sourceCountryCode: 'GB',
    sourceCurrency: 'GBP',
    destinationCountry: 'India',
    destinationCountryCode: 'IN',
    destinationCurrency: 'INR',
    minAmount: 15,
    maxAmount: 10000,
    defaultMidMarketRate: 108.50,
    baseFee: 2.80,
    quoteValiditySeconds: 45,
    supportedRails: ['imps_bank', 'swift'],
    regulatoryTier: 'LOW',
  },
  SG_INR: {
    id: 'SG_INR',
    sourceCountry: 'Singapore',
    sourceCountryCode: 'SG',
    sourceCurrency: 'SGD',
    destinationCountry: 'India',
    destinationCountryCode: 'IN',
    destinationCurrency: 'INR',
    minAmount: 25,
    maxAmount: 12000,
    defaultMidMarketRate: 63.80,
    baseFee: 4.80,
    quoteValiditySeconds: 45,
    supportedRails: ['imps_bank', 'swift'],
    regulatoryTier: 'LOW',
  },
  EUR_INR: {
    id: 'EUR_INR',
    sourceCountry: 'European Union',
    sourceCountryCode: 'EU',
    sourceCurrency: 'EUR',
    destinationCountry: 'India',
    destinationCountryCode: 'IN',
    destinationCurrency: 'INR',
    minAmount: 20,
    maxAmount: 12000,
    defaultMidMarketRate: 91.40,
    baseFee: 3.20,
    quoteValiditySeconds: 45,
    supportedRails: ['imps_bank', 'swift'],
    regulatoryTier: 'LOW',
  },
};

export const RAIL_CATALOG = [
  {
    id: 'upi_partner',
    adapterKey: 'npci',
    name: 'UPI-linked partner rail',
    shortName: 'UPI-linked',
    subtext: 'Settles via UPI partner switch into beneficiary account',
    fixedFeeAED: 12.00,
    spreadPct: 0.0058, // 0.58% FX markup
    etaMinutes: 10,
    etaSeconds: 600,
    typicalSpeedLabel: '~10 min',
    reliabilityPct: 99.2,
    riskScore: 10, // Very low operational risk
    minAmountAED: 50,
    maxAmountAED: 10000, // UPI retail limits
    allowedRecipientTypes: ['upi', 'vpa'],
    regulatoryStatus: 'AVAILABLE_LICENSED_PARTNER',
    isAvailable: true,
    provenance: DATA_PROVENANCE.CONFIGURED_ESTIMATE,
    badge: 'RECOMMENDED',
    pros: [
      'Fastest reliable retail option: ~10 minutes at 99.2% success (demo figures).',
      'Native UPI delivery directly into recipient VPA without IFSC validation delays.',
    ],
    cons: ['Capped at AED 10,000 per transaction limit', 'Slightly higher fee than correspondent bank'],
  },
  {
    id: 'imps_bank',
    adapterKey: 'bank',
    name: 'IMPS via correspondent bank',
    shortName: 'IMPS',
    subtext: 'Limitation: bank cut-off hours apply',
    fixedFeeAED: 18.00,
    spreadPct: 0.0041, // 0.41% FX markup (best conversion)
    etaMinutes: 60,
    etaSeconds: 3600,
    typicalSpeedLabel: '30 min – 2 h',
    reliabilityPct: 97.8,
    riskScore: 18,
    minAmountAED: 50,
    maxAmountAED: 25000,
    allowedRecipientTypes: ['bank_account', 'ifsc', 'upi'],
    regulatoryStatus: 'AVAILABLE_CORRESPONDENT_TIER',
    isAvailable: true,
    provenance: DATA_PROVENANCE.CONFIGURED_ESTIMATE,
    badge: 'LOWEST_COST',
    pros: ['Lowest FX spread margin (0.41%), delivering more INR to the recipient'],
    cons: ['Bank cut-off windows apply', 'Slower settlement (30 min – 2 hours) and 97.8% reliability'],
  },
  {
    id: 'blockchain_partner',
    adapterKey: 'blockchain',
    name: 'Blockchain-settled partner rail',
    shortName: 'Blockchain-settled',
    subtext: 'Limitation: max AED 10,000; confirmations currently slower than normal',
    fixedFeeAED: 9.00,
    spreadPct: 0.0087, // 0.87% FX markup
    etaMinutes: 15,
    etaSeconds: 900,
    typicalSpeedLabel: '5 – 25 min',
    reliabilityPct: 94.1,
    riskScore: 28, // Higher due to network congestion/volatility buffer
    minAmountAED: 50,
    maxAmountAED: 10000,
    allowedRecipientTypes: ['upi', 'bank_account'],
    regulatoryStatus: 'TESTNET_PILOT',
    isAvailable: true,
    provenance: DATA_PROVENANCE.TESTNET,
    badge: 'DEGRADED',
    pros: ['Lowest base transfer fee of AED 9.00', 'Cryptographic settlement audit record (Ethereum Sepolia testnet)'],
    cons: ['Degraded rail: confirmations currently slower than normal', 'Max AED 10,000 corridor limit'],
  },
  {
    id: 'swift',
    adapterKey: 'swift',
    name: 'SWIFT gpi Commercial Rail',
    shortName: 'SWIFT gpi',
    subtext: 'High-value correspondent wire via SWIFT gpi tracker',
    fixedFeeAED: 45.00,
    spreadPct: 0.0120, // 1.20%
    etaMinutes: 1440,
    etaSeconds: 86400,
    typicalSpeedLabel: '24 – 48 h',
    reliabilityPct: 99.8,
    riskScore: 12,
    minAmountAED: 500,
    maxAmountAED: 100000,
    allowedRecipientTypes: ['bank_account', 'ifsc'],
    regulatoryStatus: 'AVAILABLE_COMMERCIAL',
    isAvailable: true,
    provenance: DATA_PROVENANCE.CONFIGURED_ESTIMATE,
    badge: 'HIGH_VALUE',
    pros: ['Supports high-value transfers up to AED 100,000', 'Complete SWIFT gpi end-to-end tracking'],
    cons: ['Highest fee (AED 45.00)', 'Turnaround is 1-2 business days'],
  },
  {
    id: 'direct_npci',
    adapterKey: 'direct_npci',
    name: 'Direct NPCI Rail (Pending Bilateral License)',
    shortName: 'Direct NPCI',
    subtext: 'Not connected in this demo. It will appear here when an authorized bilateral integration exists.',
    fixedFeeAED: 0.00,
    spreadPct: 0.0,
    etaMinutes: 0.1,
    etaSeconds: 5,
    typicalSpeedLabel: 'Instant (Pending Bilateral License)',
    reliabilityPct: 99.9,
    riskScore: 5,
    minAmountAED: 10,
    maxAmountAED: 20000,
    allowedRecipientTypes: ['upi'],
    regulatoryStatus: 'PENDING_REGULATORY_APPROVAL',
    isAvailable: false,
    unavailableReason: 'Not connected in this demo. Direct bilateral NPCI rail requires an authorized cross-border license and live switch integration.',
    provenance: DATA_PROVENANCE.UNAVAILABLE,
    badge: 'NOT_AVAILABLE',
    pros: ['Zero intermediary fee', 'Instant national switch settlement'],
    cons: ['Unconnected in hackathon prototype — awaiting bilateral regulatory approval'],
  },
];
