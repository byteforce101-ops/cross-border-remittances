/**
 * server/src/routes/recipients.js
 *
 * Recipient directory endpoints.
 */

import { Router } from 'express';
import { recipientService } from '../services/recipientService.js';

const router = Router();

// GET /api/recipients
router.get('/', async (_req, res, next) => {
  try {
    const list = await recipientService.getRecipients();
    res.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/recipients/:id
router.get('/:id', async (req, res, next) => {
  try {
    const rec = await recipientService.getRecipientById(req.params.id);
    res.json({
      success: true,
      data: rec,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/recipients
router.post('/', async (req, res, next) => {
  try {
    const created = await recipientService.createRecipient(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/recipients/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await recipientService.updateRecipient(req.params.id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/recipients/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await recipientService.deleteRecipient(req.params.id);
    res.json({
      success: true,
      message: `Recipient ${req.params.id} successfully deleted.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
