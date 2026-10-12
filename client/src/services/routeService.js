/**
 * client/src/services/routeService.js
 *
 * Multi-rail analysis, transparent scoring, and trade-off comparison.
 * Connects to backend /api/routes/compare for authoritative route evaluation.
 */

import { fxService } from './fxService.js';
import { apiClient } from './apiClient.js';

export const ROUTES = [
  {
    id: 'upi_partner',
    name: 'UPI-linked partner rail',
    shortName: 'UPI-linked',
    subtext: 'Settles via UPI',
    feeAED: 12.00,
    rateSpreadPct: 0.0058,
    appliedRate: 23.98,
    eta: '~10 min',
    etaSec: 600,
    reliability: 99.2,
    badge: 'RECOMMENDED',
    available: true,
    speedLabel: 'Fastest reliable option (~10 min)',
    pros: [
      'Fastest reliable option: about 10 minutes at 99.2% success (demo figures).',
      'Native UPI delivery into recipient account without manual IBAN validation.',
    ],
    cons: ['Slightly higher fee than correspondent bank'],
  },
  {
    id: 'imps_bank',
    name: 'IMPS via correspondent bank',
    shortName: 'IMPS',
    subtext: 'Limitation: bank cut-off hours apply',
    feeAED: 18.00,
    rateSpreadPct: 0.0041,
    appliedRate: 24.02,
    eta: '30 min – 2 h',
    etaSec: 3600,
    reliability: 97.8,
    badge: 'LOWEST_COST',
    available: true,
    speedLabel: '30 min – 2 hours',
    pros: ['Lower FX spread margin resulting in higher converted INR'],
    cons: ['Bank cut-off hours apply', 'Lower reliability (97.8%) and slower settlement'],
  },
  {
    id: 'blockchain_partner',
    name: 'Blockchain-settled partner rail',
    shortName: 'Blockchain-settled',
    subtext: 'Limitation: max AED 10,000; confirmations currently slower than normal',
    feeAED: 9.00,
    rateSpreadPct: 0.0087,
    appliedRate: 23.91,
    eta: '5 – 25 min',
    etaSec: 900,
    reliability: 94.1,
    badge: 'DEGRADED',
    available: true,
    speedLabel: '5 – 25 min (degraded condition)',
    pros: ['Low base transfer fee of AED 9.00', 'Cryptographic settlement receipt (Sepolia testnet simulated)'],
    cons: ['Degraded rail: confirmations currently slower than normal', 'Max AED 10,000 corridor limit'],
  },
  {
    id: 'direct_npci',
    name: 'Direct NPCI rail',
    shortName: 'Direct NPCI',
    subtext: 'Not connected in this demo. It will appear here when an authorized integration exists.',
    feeAED: 0.00,
    rateSpreadPct: 0.0,
    appliedRate: 24.12,
    eta: 'Instant',
    etaSec: 5,
    reliability: 99.9,
    badge: 'NOT_AVAILABLE',
    available: false,
    unavailableReason: 'Not connected in this demo. It will appear here when an authorized integration exists.',
    pros: ['Zero intermediary fee', 'Instant national switch settlement'],
    cons: ['Requires official bilateral regulatory licensing (not integrated in demo)'],
  },
];

export const routeService = {
  getRoutes() {
    return ROUTES;
  },

  /**
   * Fetches route comparison from the backend API.
   */
  async fetchComparedRoutes({ fromAmount, fromCurrency = 'AED', recipientName = 'the recipient' }) {
    return apiClient.post('/routes/compare', {
      fromAmount: parseFloat(fromAmount),
      fromCurrency,
      recipientName,
    });
  },

  analyzeRoutes(fromAmount, fromCurrency = 'AED') {
    const amt = parseFloat(fromAmount) || 0;

    return ROUTES.map(route => {
      if (!route.available) {
        return {
          ...route,
          calc: null,
          isAvailable: false,
        };
      }

      const calc = fxService.calculate({
        fromAmount: amt,
        fromCurrency,
        route,
      });

      return {
        ...route,
        calc,
        isAvailable: true,
        costAED: calc.totalCostAED,
        feeAEDFormatted: fxService.formatAED(calc.feeAED),
        fxCostAEDFormatted: fxService.formatAED(calc.fxCostAED),
        totalCostFormatted: fxService.formatAED(calc.totalCostAED),
        recipientINRFormatted: fxService.formatINR(calc.recipientINR),
      };
    });
  },

  getRecommendation(analyzedRoutes, recipientName = 'the recipient') {
    const available = analyzedRoutes.filter(r => r.isAvailable);
    if (!available.length) return null;

    const recommended = available.find(r => r.id === 'upi_partner') || available[0];
    const cheapest = [...available].sort((a, b) => a.calc.totalCostAED - b.calc.totalCostAED)[0];

    const diffCostAED = (recommended.calc.totalCostAED - cheapest.calc.totalCostAED).toFixed(2);
    const diffRecipientINR = (cheapest.calc.recipientINR - recommended.calc.recipientINR).toFixed(2);

    const bullets = [
      `Fastest reliable option: about 10 minutes at ${recommended.reliability}% success (demo figures).`,
    ];

    if (cheapest.id !== recommended.id && parseFloat(diffCostAED) > 0) {
      bullets.push(
        `Costs AED ${diffCostAED} more than the cheapest route, and ${recipientName} gets ₹${diffRecipientINR} less, in exchange for hours less waiting and fewer failures.`
      );
    } else {
      bullets.push(`Optimal total cost with minimal FX spread and fastest turnaround.`);
    }

    bullets.push(`${recipientName}'s UPI ID is compatible, so no bank-detail re-entry is needed.`);

    return {
      route: recommended,
      title: `Why we recommend the ${recommended.name}`,
      bullets,
      cheapestRoute: cheapest,
    };
  },
};
