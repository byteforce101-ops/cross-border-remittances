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

// POST /api/fx/quote
router.post('/quote', (req, res, next) => {
  try {
    const { fromAmount, fromCurrency, routeId } = req.body;
    if (!fromAmount) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'fromAmount is required and must be greater than 0.' },
      });
    }

    const quote = fxService.calculateQuote({
      fromAmount,
      fromCurrency,
      routeId,
    });

    res.json({
      success: true,
      data: quote,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
