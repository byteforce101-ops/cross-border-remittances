/**
 * server/src/routes/health.js
 *
 * Health check and environment disclosure endpoint.
 */

import { Router } from 'express';
import { getAdaptersStatus } from '../../../integrations/factory.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const adapters = await getAdaptersStatus();

    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'remittance-orchestration-api',
        environment: 'DEMO / SANDBOX',
        timestamp: new Date().toISOString(),
        version: '1.0.0-phase3',
        disclaimer: 'This environment is operating entirely with mock adapters and simulated settlement engines. No real money moves.',
        adapters: {
          npci: {
            mode: 'MOCK',
            status: adapters.npci?.available ? 'operational' : 'unavailable',
            description: adapters.npci?.name,
          },
          bank: {
            mode: 'MOCK',
            status: adapters.bank?.available ? 'operational' : 'unavailable',
            description: adapters.bank?.name,
          },
          blockchain: {
            mode: 'MOCK / TESTNET_SIMULATION',
            status: adapters.blockchain?.available ? 'operational' : 'unavailable',
            description: adapters.blockchain?.name,
          },
          swift: {
            mode: 'MOCK',
            status: adapters.swift?.available ? 'operational' : 'unavailable',
            description: adapters.swift?.name,
          },
          direct_npci: {
            mode: 'UNCONNECTED',
            status: 'unavailable',
            description: adapters.direct_npci?.name,
            reason: 'Requires bilateral inter-switch authorization and live NPCI credentials.',
          },
        },
        fxProvider: {
          mode: 'MOCK',
          description: 'Static indicative rates with mid-market benchmarks.',
        },
        riskEngine: {
          mode: 'SIMULATED_DETERMINISTIC',
          description: 'Explainable rule-based scoring engine.',
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
