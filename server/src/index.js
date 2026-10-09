/**
 * server/src/index.js
 *
 * Express application entry point.
 * Registers middleware, mounts route modules, and starts the HTTP server.
 *
 * Nothing is implemented yet — this file is a bootstrap placeholder
 * that will be filled in during subsequent phases.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'remittance-api', timestamp: new Date().toISOString() });
});

// ── Route mounts (to be added per phase) ────────────────────────────────────
// import transactionRoutes from './routes/transactions.js';
// import routeOptimizerRoutes from './routes/routeOptimizer.js';
// import complianceRoutes from './routes/compliance.js';
// import fxRoutes from './routes/fx.js';
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/route', routeOptimizerRoutes);
// app.use('/api/compliance', complianceRoutes);
// app.use('/api/fx', fxRoutes);

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});

export default app;
