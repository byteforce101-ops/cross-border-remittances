/**
 * server/src/routes/routes.js
 *
 * Route comparison and orchestration recommendation endpoint.
 */

import { Router } from 'express';
import { routeService } from '../services/routeService.js';

const router = Router();

// POST /api/routes/compare
router.post('/compare', async (req, res, next) => {
  try {
    const { fromAmount, amount, fromCurrency, currency, recipientName } = req.body;
    const result = await routeService.compareRoutes({
      fromAmount: fromAmount || amount || 1000,
      fromCurrency: fromCurrency || currency || 'AED',
      recipientName: recipientName || 'the recipient',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
