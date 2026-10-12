/**
 * server/src/routes/risk.js
 *
 * Risk assessment and compliance preview endpoint.
 */

import { Router } from 'express';
import { riskService } from '../services/riskService.js';

const router = Router();

// POST /api/risk/evaluate
router.post('/evaluate', (req, res, next) => {
  try {
    const { fromAmount, fromCurrency, recipientUpi, recipientName, purpose, corridor } = req.body;
    const assessment = riskService.evaluate({
      fromAmount,
      fromCurrency,
      recipientUpi,
      recipientName,
      purpose,
      corridor,
    });

    res.json({
      success: true,
      data: assessment,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
