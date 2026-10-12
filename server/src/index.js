/**
 * server/src/index.js
 *
 * Express application entry point for the Cross-Border Remittance Platform API.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import healthRoutes from './routes/health.js';
import fxRoutes from './routes/fx.js';
import routeRoutes from './routes/routes.js';
import riskRoutes from './routes/risk.js';
import transactionRoutes from './routes/transactions.js';
import recipientRoutes from './routes/recipients.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;

// ── Security & Request Parsing Middleware ─────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (e.g. curl, test runners) or configured localhost origins
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('CORS: Origin not allowed'));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '1mb' }));

// ── API Route Mounts ──────────────────────────────────────────────────────────
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/fx', fxRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recipients', recipientRoutes);

// ── 404 Handler for Unknown API Routes ────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API endpoint does not exist.',
    },
  });
});

// ── Centralized Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Start HTTP Server ─────────────────────────────────────────────────────────
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_TEST_CONTEXT || process.argv.some(a => a.includes('--test'));
if (!isTestEnv) {
  app.listen(PORT, () => {
    console.log(`[server] RemittanceOS API server listening on http://localhost:${PORT}`);
  });
}

export default app;
