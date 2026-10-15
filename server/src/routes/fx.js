/**
 * server/src/routes/fx.js
 *
 * Foreign exchange rates and calculation quote endpoints.
 */

import { Router } from 'express';
import { fxService } from '../services/fxService.js';

const router = Router();

// GET /api/fx/currencies
router.get('/currencies', (_req, res) => {
  res.json({
    success: true,
    data: {
      currencies: fxService.getSupportedCurrencies(),
      baseTarget: 'INR',
    },
  });
});

async function handleQuoteRequest(req, res, next) {
  try {
    const fromAmount = req.method === 'GET' ? req.query.fromAmount || req.query.amount : req.body?.fromAmount;
    const fromCurrency = req.method === 'GET' ? req.query.fromCurrency || req.query.currency : req.body?.fromCurrency;
    const routeId = req.method === 'GET' ? req.query.routeId : req.body?.routeId;

    if (!fromAmount) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'fromAmount is required and must be greater than 0.' },
      });
    }

    const code = (fromCurrency || 'AED').toUpperCase();
    console.log(`[FX Route] Incoming quote request for ${fromAmount} ${code} via route ${routeId || 'default'}`);

    // Resolve rate with live provenance
    const resolvedRate = await fxService.resolveRateWithProvenance(code);
    console.log(`[FX Route] Resolved rate from provider: ${resolvedRate.provider} (${resolvedRate.provenance}), rate: ${resolvedRate.rate}, isLive: ${resolvedRate.isLive}, isCached: ${resolvedRate.isCached}`);

    const quote = fxService.calculateQuote({
      fromAmount,
      fromCurrency: code,
      routeId: routeId || 'upi_partner',
      liveReferenceRate: resolvedRate.rate,
      rateProvenance: resolvedRate.provenance,
      rateProviderName: resolvedRate.provider,
    });

    res.json({
      success: true,
      data: {
        ...quote,
        liveResolution: {
          provider: resolvedRate.provider,
          providerId: resolvedRate.providerId,
          provenance: resolvedRate.provenance,
          rate: resolvedRate.rate,
          timestamp: resolvedRate.timestamp,
          isLive: Boolean(resolvedRate.isLive),
          isCached: Boolean(resolvedRate.isCached),
          isStale: Boolean(resolvedRate.isStale),
          staleWarning: resolvedRate.staleWarning || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/fx/quote
router.get('/quote', handleQuoteRequest);

// POST /api/fx/quote
router.post('/quote', handleQuoteRequest);

export default router;
