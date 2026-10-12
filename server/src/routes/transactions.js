/**
 * server/src/routes/transactions.js
 *
 * Transaction lifecycle management endpoints.
 */

import { Router } from 'express';
import { transactionService } from '../services/transactionService.js';

const router = Router();

// GET /api/transactions
router.get('/', async (req, res, next) => {
  try {
    const { status, route, search } = req.query;
    const list = await transactionService.getTransactions({ status, route, search });
    res.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res, next) => {
  try {
    const tx = await transactionService.getTransactionById(req.params.id);
    res.json({
      success: true,
      data: tx,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
router.post('/', async (req, res, next) => {
  try {
    const idempotencyKey = req.header('Idempotency-Key') || req.body.idempotencyKey;
    const created = await transactionService.createTransaction(req.body, idempotencyKey);

    const statusCode = created.isIdempotentReplay ? 200 : 201;
    res.status(statusCode).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions/:id/status
router.post('/:id/status', async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Target status is required.' },
      });
    }

    const updated = await transactionService.updateStatus(req.params.id, status, reason);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
