/** client/src/services/routeService.js — Mock route analysis */

export const ROUTES = [
  {
    id: 'npci',
    name: 'UPI / NPCI',
    description: 'Direct UPI settlement via NPCI infrastructure',
    icon: 'zap',
    costMultiplier: 1.0,
    speedSec: 30,
    reliability: 98.7,
    riskLevel: 'LOW',
    availability: 'operational',
    pros: ['Fastest settlement', 'Lowest cost', 'Native UPI support'],
    cons: ['UPI ID required for recipient'],
    badge: 'RECOMMENDED',
  },
  {
    id: 'blockchain',
    name: 'Blockchain Settlement',
    description: 'Ethereum Sepolia smart-contract settlement with on-chain audit trail',
    icon: 'link',
    costMultiplier: 0.7,
    speedSec: 15,
    reliability: 94.2,
    riskLevel: 'MEDIUM',
    availability: 'testnet',
    pros: ['Lowest cost', 'Immutable audit trail', 'Fastest settlement'],
    cons: ['Testnet only', 'Higher technical risk', 'Gas cost variability'],
    badge: 'TESTNET',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank-to-bank transfer via correspondent banking network',
    icon: 'building2',
    costMultiplier: 2.5,
    speedSec: 86400,
    reliability: 99.5,
    riskLevel: 'LOW',
    availability: 'operational',
    pros: ['Highly reliable', 'Bank account support', 'No UPI needed'],
    cons: ['1–2 business days', 'Higher fees'],
    badge: null,
  },
  {
    id: 'swift',
    name: 'SWIFT / Correspondent',
    description: 'Traditional SWIFT interbank wire transfer',
    icon: 'globe',
    costMultiplier: 4.0,
    speedSec: 259200,
    reliability: 99.1,
    riskLevel: 'LOW',
    availability: 'operational',
    pros: ['Universal acceptance', 'Highest reliability', 'Large amounts'],
    cons: ['Slowest (1–3 days)', 'Highest cost', 'Multiple intermediaries'],
    badge: null,
  },
];

export const routeService = {
  analyzeRoutes(fromAmount, fromCurrency, fxCalc) {
    const baseCostINR = fxCalc.transferFeeINR;
    return ROUTES.map(route => ({
      ...route,
      costINR: Math.round(baseCostINR * route.costMultiplier),
      netRecipientINR: Math.round(fxCalc.grossINR - baseCostINR * route.costMultiplier),
    }));
  },

  recommend(routes, riskScore) {
    if (riskScore > 60) {
      return routes.find(r => r.id === 'swift') || routes[0];
    }
    // Prefer NPCI for speed+cost; blockchain if testnet acceptable and very low risk
    return routes.find(r => r.id === 'npci') || routes[0];
  },
};
