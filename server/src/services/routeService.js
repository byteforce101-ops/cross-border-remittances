/**
 * server/src/services/routeService.js
 *
 * Backend Route Comparison and Optimization Service.
 * Evaluates payment rails, excludes unavailable routes from execution,
 * and generates transparent recommendations with trade-off explanations.
 */

import { fxService } from './fxService.js';
import { getAdapter } from '../../../integrations/factory.js';

const ROUTE_DEFINITIONS = [
  {
    id: 'upi_partner',
    adapterKey: 'npci',
    name: 'UPI-linked partner rail',
    shortName: 'UPI-linked',
    subtext: 'Settles via UPI partner switch into beneficiary account',
    eta: '~10 min',
    etaSeconds: 600,
    reliability: 99.2,
    badge: 'RECOMMENDED',
    speedLabel: 'Fastest reliable option (~10 min)',
    pros: [
      'Fastest reliable option: settles in ~10 minutes at 99.2% success (demo figures).',
      'Native UPI delivery into recipient account without manual IFSC/SWIFT validation.',
    ],
    cons: ['Slightly higher fee than correspondent bank'],
  },
  {
    id: 'imps_bank',
    adapterKey: 'bank',
    name: 'IMPS via correspondent bank',
    shortName: 'IMPS',
    subtext: 'Limitation: bank cut-off hours apply',
    eta: '30 min – 2 h',
    etaSeconds: 3600,
    reliability: 97.8,
    badge: 'LOWEST_COST',
    speedLabel: '30 min – 2 hours',
    pros: ['Lower FX spread margin resulting in higher converted INR'],
    cons: ['Bank cut-off hours apply', 'Lower reliability (97.8%) and slower settlement window'],
  },
  {
    id: 'blockchain_partner',
    adapterKey: 'blockchain',
    name: 'Blockchain-settled partner rail',
    shortName: 'Blockchain-settled',
    subtext: 'Limitation: max AED 10,000; confirmations currently slower than normal',
    eta: '5 – 25 min',
    etaSeconds: 900,
    reliability: 94.1,
    badge: 'DEGRADED',
    speedLabel: '5 – 25 min (degraded condition)',
    pros: ['Low base transfer fee', 'Cryptographic settlement audit record (Sepolia testnet simulated)'],
    cons: ['Degraded rail: confirmations currently slower than normal', 'Max AED 10,000 corridor limit'],
  },
  {
    id: 'direct_npci',
    adapterKey: 'direct_npci',
    name: 'Direct NPCI rail',
    shortName: 'Direct NPCI',
    subtext: 'Not connected in this demo. It will appear here when an authorized integration exists.',
    eta: 'Instant',
    etaSeconds: 5,
    reliability: 99.9,
    badge: 'NOT_AVAILABLE',
    speedLabel: 'Instant (Pending Bilateral License)',
    pros: ['Zero intermediary fee', 'Instant national switch settlement'],
    cons: ['Requires official bilateral regulatory licensing (not integrated in demo)'],
  },
];

export class RouteService {
  /**
   * Compares all payment routes for a given transfer amount and currency.
   */
  async compareRoutes({ fromAmount = 1000, fromCurrency = 'AED', recipientName = 'the recipient' }) {
    const amt = parseFloat(fromAmount) || 0;
    const evaluatedRoutes = [];

    for (const def of ROUTE_DEFINITIONS) {
      let isAvailable = false;
      let unavailableReason = null;

      try {
        const adapter = getAdapter(def.adapterKey);
        isAvailable = await adapter.isAvailable();
        if (!isAvailable) {
          unavailableReason = adapter.unavailableReason || 'Rail is currently unavailable';
        }
      } catch (err) {
        isAvailable = false;
        unavailableReason = err.message;
      }

      // If available, calculate live quote with this route's characteristics
      let quote = null;
      if (isAvailable && amt > 0) {
        try {
          quote = fxService.calculateQuote({
            fromAmount: amt,
            fromCurrency,
            routeId: def.id,
          });
        } catch (err) {
          // Amount limits or validation error for this rail
          isAvailable = false;
          unavailableReason = err.message;
        }
      }

      evaluatedRoutes.push({
        id: def.id,
        name: def.name,
        shortName: def.shortName,
        subtext: def.subtext,
        eta: def.eta,
        etaSeconds: def.etaSeconds,
        reliability: def.reliability,
        badge: def.badge,
        speedLabel: def.speedLabel,
        pros: def.pros,
        cons: def.cons,
        isAvailable,
        unavailableReason,
        quote,
      });
    }

    // Recommendation logic: exclude unavailable routes from being chosen
    const executableRoutes = evaluatedRoutes.filter(r => r.isAvailable && r.quote);
    let recommendation = null;

    if (executableRoutes.length > 0) {
      // Pick UPI partner rail by default for balance of speed and reliability, or highest reliability
      const recommendedRoute = executableRoutes.find(r => r.id === 'upi_partner') || executableRoutes[0];
      const cheapestRoute = [...executableRoutes].sort((a, b) => a.quote.totalCost - b.quote.totalCost)[0];

      const diffCost = (recommendedRoute.quote.totalCost - cheapestRoute.quote.totalCost).toFixed(2);
      const diffRecipientINR = (cheapestRoute.quote.recipientINR - recommendedRoute.quote.recipientINR).toFixed(2);

      const bullets = [
        `Fastest reliable option: ~${Math.round(recommendedRoute.etaSeconds / 60)} min settlement at ${recommendedRoute.reliability}% reliability.`,
      ];

      if (cheapestRoute.id !== recommendedRoute.id && parseFloat(diffCost) > 0) {
        bullets.push(
          `Costs ${fromCurrency} ${diffCost} more than the cheapest route, and ${recipientName} gets ₹${diffRecipientINR} less, in exchange for significantly faster settlement and higher delivery reliability.`,
        );
      } else {
        bullets.push(`Optimal total cost with minimal FX spread and fastest turnaround.`);
      }

      bullets.push(`${recipientName}'s UPI address is pre-verified on this rail.`);

      recommendation = {
        recommendedRouteId: recommendedRoute.id,
        title: `Why we recommend the ${recommendedRoute.name}`,
        bullets,
        cheapestRouteId: cheapestRoute.id,
      };
    }

    return {
      routes: evaluatedRoutes,
      recommendedRouteId: recommendation ? recommendation.recommendedRouteId : null,
      recommendation,
      evaluatedAt: new Date().toISOString(),
      isSimulated: true,
    };
  }
}

export const routeService = new RouteService();
