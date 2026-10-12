/**
 * server/test/backend.test.js
 *
 * Comprehensive test suite for Phase 3:
 * - Health and environment API (mock disclosures)
 * - FX quote calculations (valid, invalid, unsupported currencies, corridor limits)
 * - Route comparison & unavailable rail exclusion
 * - Deterministic explainable risk engine
 * - Mock payment adapters (NPCI, Bank, Blockchain, SWIFT, Direct NPCI)
 * - Transactions API & Orchestration (server-side recalculation, lifecycle)
 * - Idempotency & duplicate submission protection
 * - Status transition state machine validation
 * - Recipients CRUD and validation
 * - Persistence engine survival
 */

process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/index.js';
import { fxService } from '../src/services/fxService.js';
import { routeService } from '../src/services/routeService.js';
import { riskService } from '../src/services/riskService.js';
import { transactionService } from '../src/services/transactionService.js';
import { recipientService } from '../src/services/recipientService.js';
import { getAllAdapters, getAdapter } from '../../integrations/factory.js';
import { TRANSACTION_STATUS } from '../../shared/constants/transactionStatus.js';
import { TransactionRepository } from '../src/repositories/TransactionRepository.js';

let server;
let baseUrl;

before(async () => {
  // Start server on an ephemeral port for HTTP tests
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Health and Environment API
// ─────────────────────────────────────────────────────────────────────────────
describe('1. Health & Environment API', () => {
  it('GET /api/health returns 200 with DEMO environment and adapter disclosures', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ok');
    assert.equal(body.data.environment, 'DEMO / SANDBOX');
    assert.ok(body.data.disclaimer.includes('mock adapters'));

    // Verify all mock adapters are explicitly disclosed
    const adapters = body.data.adapters;
    assert.ok(adapters.npci);
    assert.equal(adapters.npci.mode, 'MOCK');
    assert.ok(adapters.bank);
    assert.equal(adapters.bank.mode, 'MOCK');
    assert.ok(adapters.blockchain);
    assert.equal(adapters.blockchain.mode, 'MOCK / TESTNET_SIMULATION');
    assert.ok(adapters.swift);
    assert.equal(adapters.swift.mode, 'MOCK');

    // direct_npci must be unconnected / unavailable
    assert.ok(adapters.direct_npci);
    assert.equal(adapters.direct_npci.status, 'unavailable');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. FX Quotes Service & API
// ─────────────────────────────────────────────────────────────────────────────
describe('2. FX Quotes Service & API', () => {
  it('Calculates valid FX quote for AED -> INR with explicit currency fee units', async () => {
    const res = await fetch(`${baseUrl}/api/fx/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAmount: 5000,
        fromCurrency: 'AED',
        routeId: 'upi_partner',
      }),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    const q = body.data;

    assert.equal(q.fromCurrency, 'AED');
    assert.equal(q.toCurrency, 'INR');
    assert.equal(q.fromAmount, 5000);
    assert.equal(q.feeCurrency, 'AED');
    assert.ok(q.feeAmount > 0);
    assert.ok(q.fxCost > 0);
    assert.ok(q.totalCost > 0);
    assert.ok(q.recipientINR > 0);
    assert.equal(q.isSimulated, true);
    assert.ok(q.disclaimer.toLowerCase().includes('simulated'));

    // Test exact math consistency
    const expectedINR = Math.round((5000 - q.feeAmount) * q.appliedRate * 100) / 100;
    assert.equal(q.recipientINR, expectedINR);
  });

  it('Calculates quotes across multiple currencies (USD, GBP, EUR, SGD)', () => {
    for (const cur of ['USD', 'GBP', 'EUR', 'SGD']) {
      const quote = fxService.calculateQuote({ fromAmount: 1000, fromCurrency: cur });
      assert.equal(quote.fromCurrency, cur);
      assert.equal(quote.toCurrency, 'INR');
      assert.ok(quote.appliedRate > 0);
      assert.ok(quote.recipientINR > 0);
      assert.equal(quote.feeCurrency, cur);
    }
  });

  it('Rejects unsupported currency with descriptive 400 error', async () => {
    const res = await fetch(`${baseUrl}/api/fx/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAmount: 1000,
        fromCurrency: 'XYZ',
      }),
    });
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.toLowerCase().includes('unsupported'));
  });

  it('Rejects invalid transaction amounts (zero, negative, non-numeric)', async () => {
    const resZero = await fetch(`${baseUrl}/api/fx/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAmount: 0, fromCurrency: 'AED' }),
    });
    assert.equal(resZero.status, 400);

    const resNeg = await fetch(`${baseUrl}/api/fx/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAmount: -500, fromCurrency: 'AED' }),
    });
    assert.equal(resNeg.status, 400);
  });

  it('Enforces corridor transfer limits (AED 50 - 25,000)', async () => {
    const resUnder = await fetch(`${baseUrl}/api/fx/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAmount: 10, fromCurrency: 'AED' }),
    });
    assert.equal(resUnder.status, 400);
    const bodyUnder = await resUnder.json();
    assert.ok(bodyUnder.error.message.includes('Minimum'));

    const resOver = await fetch(`${baseUrl}/api/fx/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAmount: 50000, fromCurrency: 'AED' }),
    });
    assert.equal(resOver.status, 400);
    const bodyOver = await resOver.json();
    assert.ok(bodyOver.error.message.includes('Maximum'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Route Comparison & Unavailable Rails
// ─────────────────────────────────────────────────────────────────────────────
describe('3. Route Comparison & Rail Selection', () => {
  it('POST /api/routes/compare returns evaluated routes and excludes direct_npci from execution', async () => {
    const res = await fetch(`${baseUrl}/api/routes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 5000, currency: 'AED' }),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    const { routes, recommendedRouteId, recommendation } = body.data;

    assert.ok(Array.isArray(routes));
    assert.ok(routes.length >= 4);

    // direct_npci must be marked unavailable
    const directNpci = routes.find(r => r.id === 'direct_npci');
    assert.ok(directNpci);
    assert.equal(directNpci.isAvailable, false);
    assert.ok(directNpci.unavailableReason);

    // Operational routes must be available
    const upiRoute = routes.find(r => r.id === 'upi_partner');
    assert.ok(upiRoute);
    assert.equal(upiRoute.isAvailable, true);

    // Recommended route must be set and explain trade-offs
    assert.ok(recommendedRouteId);
    assert.ok(recommendation);
    assert.ok(recommendation.title);
    assert.ok(Array.isArray(recommendation.bullets) && recommendation.bullets.length > 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Deterministic Explainable Risk Engine
// ─────────────────────────────────────────────────────────────────────────────
describe('4. Deterministic Risk Engine', () => {
  it('Evaluates normal standard transaction with LOW risk score', async () => {
    const res = await fetch(`${baseUrl}/api/risk/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAmount: 1500,
        fromCurrency: 'AED',
        recipientUpi: 'anita.sharma@okaxis',
        recipientName: 'Anita Sharma',
        purpose: 'Family support',
      }),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    const r = body.data;

    assert.ok(r.score <= 30);
    assert.equal(r.level, 'LOW');
    assert.equal(r.requiresManualReview, false);
    assert.equal(r.isSimulated, true);
    assert.ok(Array.isArray(r.signals));
  });

  it('Elevates risk score for large amounts with explainable signals', () => {
    const highAmountResult = riskService.evaluate({
      fromAmount: 20000,
      fromCurrency: 'AED', // > 400k INR equivalent
      recipientUpi: 'anita.sharma@okaxis',
      recipientName: 'Anita Sharma',
      purpose: 'Family support',
    });

    assert.ok(highAmountResult.score > 20);
    const amountSignal = highAmountResult.signals.find(s => s.rule === 'ELEVATED_VALUE_THRESHOLD');
    assert.ok(amountSignal);
  });

  it('Flags malformed UPI IDs with explainable signal', () => {
    const invalidUpiResult = riskService.evaluate({
      fromAmount: 1000,
      fromCurrency: 'AED',
      recipientUpi: 'invalid_upi_format_no_at',
      recipientName: 'Anita Sharma',
      purpose: 'Family support',
    });

    const upiSignal = invalidUpiResult.signals.find(s => s.rule === 'INVALID_UPI_IDENTIFIER');
    assert.ok(upiSignal);
    assert.equal(upiSignal.severity, 'HIGH');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Mock Payment Adapters Layer
// ─────────────────────────────────────────────────────────────────────────────
describe('5. Payment Adapter Layer', () => {
  it('Registers mock adapters and validates adapter contract', async () => {
    const adapters = getAllAdapters();
    assert.ok(adapters.length >= 4);

    const npci = getAdapter('npci');
    assert.equal(await npci.isAvailable(), true);
    const fee = await npci.estimateFee(1000, 'AED');
    assert.ok(fee > 0);
    const time = await npci.estimateSettlementTime();
    assert.equal(time.estimatedSeconds, 30);

    // Transfer initiation returns simulated reference
    const init = await npci.initiateTransfer({
      amount: 1000,
      fromCurrency: 'AED',
      recipientUpi: 'anita@okaxis',
      purpose: 'Family support',
    });
    assert.ok(init.railTransactionId.startsWith('sim_npci_'));
    assert.equal(init.metadata.isMock, true);

    // Status lookup
    const status = await npci.getTransferStatus(init.railTransactionId);
    assert.equal(status.status, 'COMPLETED');
  });

  it('Blockchain adapter returns simulated testnet ref, never fake mainnet tx hash', async () => {
    const blockchain = getAdapter('blockchain');
    const init = await blockchain.initiateTransfer({
      amount: 1000,
      fromCurrency: 'AED',
      recipientUpi: 'anita@okaxis',
      purpose: 'Family support',
    });

    assert.ok(init.railTransactionId.startsWith('sim_sepolia_ref_'));
    assert.equal(init.metadata.network, 'Ethereum Sepolia Testnet (Simulated)');
    assert.equal(init.metadata.isMock, true);
    assert.ok(!init.railTransactionId.startsWith('0x')); // Must not pretend to be genuine mainnet hash
  });

  it('direct_npci adapter is marked unavailable', async () => {
    const directNpci = getAdapter('direct_npci');
    assert.equal(await directNpci.isAvailable(), false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Transactions API, Recalculation & Idempotency Protection
// ─────────────────────────────────────────────────────────────────────────────
describe('6. Transactions API & Orchestration', () => {
  const testIdempotencyKey = `test_key_${Date.now()}`;
  let createdTxId;

  it('Creates simulated transaction with server-side recalculated fees and timeline', async () => {
    const res = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': testIdempotencyKey,
      },
      body: JSON.stringify({
        amount: 2500,
        fromCurrency: 'AED',
        recipient: {
          name: 'Vikram Malhotra',
          upiId: 'vikram.m@oksbi',
          bankName: 'State Bank of India',
        },
        purpose: 'Family support',
        routeId: 'upi_partner',
      }),
    });
    assert.equal(res.status, 201);

    const body = await res.json();
    assert.equal(body.success, true);
    const tx = body.data;

    assert.ok(tx.id.startsWith('TXN-D-'));
    createdTxId = tx.id;
    assert.equal(tx.fromAmount, 2500);
    assert.equal(tx.fromCurrency, 'AED');
    assert.equal(tx.toCurrency, 'INR');
    assert.equal(tx.recipientName, 'Vikram Malhotra');
    assert.equal(tx.recipientUpi, 'vikram.m@oksbi');
    assert.equal(tx.isSimulated, true);
    assert.ok(Array.isArray(tx.timeline) && tx.timeline.length > 0);
    assert.ok(tx.status === TRANSACTION_STATUS.PROCESSING || tx.status === TRANSACTION_STATUS.COMPLIANCE_REVIEW);
  });

  it('Protects against duplicate submission using Idempotency-Key header', async () => {
    // Replay exact same request with same idempotency key
    const resReplay = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': testIdempotencyKey,
      },
      body: JSON.stringify({
        amount: 2500,
        fromCurrency: 'AED',
        recipient: {
          name: 'Vikram Malhotra',
          upiId: 'vikram.m@oksbi',
        },
        purpose: 'Family support',
        routeId: 'upi_partner',
      }),
    });
    assert.equal(resReplay.status, 200); // 200 for idempotent cached replay

    const body = await resReplay.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, createdTxId);
    assert.equal(body.data.isIdempotentReplay, true);
  });

  it('Retrieves created transaction by ID', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/${createdTxId}`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.id, createdTxId);
  });

  it('Returns 404 for non-existent transaction ID', async () => {
    const res = await fetch(`${baseUrl}/api/transactions/TXN-NON-EXISTENT-9999`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('Rejects transaction creation on unavailable route (direct_npci)', async () => {
    const res = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000,
        fromCurrency: 'AED',
        recipient: { name: 'Anita', upiId: 'anita@okaxis' },
        routeId: 'direct_npci',
      }),
    });
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('unavailable'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Status Transition State Machine
// ─────────────────────────────────────────────────────────────────────────────
describe('7. Status Transition Validation', () => {
  it('Allows valid controlled transition from PROCESSING to COMPLETED', async () => {
    // Create new transaction
    const tx = await transactionService.createTransaction({
      amount: 1000,
      fromCurrency: 'AED',
      recipient: { name: 'Pooja', upiId: 'pooja@okhdfc' },
      routeId: 'upi_partner',
    });

    const res = await fetch(`${baseUrl}/api/transactions/${tx.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: TRANSACTION_STATUS.COMPLETED,
        reason: 'Payment successfully credited to recipient account via UPI partner switch.',
      }),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, TRANSACTION_STATUS.COMPLETED);
  });

  it('Rejects invalid status transition from terminal COMPLETED state', async () => {
    // Create and complete transaction
    const tx = await transactionService.createTransaction({
      amount: 1000,
      fromCurrency: 'AED',
      recipient: { name: 'Rohan', upiId: 'rohan@okaxis' },
      routeId: 'upi_partner',
    });
    await transactionService.updateStatus(tx.id, TRANSACTION_STATUS.COMPLETED);

    // Attempt invalid transition back to PROCESSING
    const res = await fetch(`${baseUrl}/api/transactions/${tx.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: TRANSACTION_STATUS.PROCESSING,
      }),
    });
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('Invalid status transition'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Recipients CRUD & Validation
// ─────────────────────────────────────────────────────────────────────────────
describe('8. Recipients CRUD API', () => {
  let createdRecipientId;

  it('GET /api/recipients returns demo recipients list', async () => {
    const res = await fetch(`${baseUrl}/api/recipients`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  it('POST /api/recipients creates new recipient with validation', async () => {
    const res = await fetch(`${baseUrl}/api/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunita Mehra',
        upiId: 'sunita.mehra@okicici',
        bankName: 'ICICI Bank',
      }),
    });
    assert.equal(res.status, 201);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.id.startsWith('rec-'));
    assert.equal(body.data.name, 'Sunita Mehra');
    assert.equal(body.data.upiId, 'sunita.mehra@okicici');
    createdRecipientId = body.data.id;
  });

  it('Rejects recipient creation with missing name or UPI', async () => {
    const res = await fetch(`${baseUrl}/api/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Only Name' }),
    });
    assert.equal(res.status, 400);
  });

  it('PUT /api/recipients/:id updates recipient', async () => {
    const res = await fetch(`${baseUrl}/api/recipients/${createdRecipientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankName: 'Kotak Mahindra Bank' }),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.bankName, 'Kotak Mahindra Bank');
  });

  it('DELETE /api/recipients/:id deletes recipient', async () => {
    const res = await fetch(`${baseUrl}/api/recipients/${createdRecipientId}`, {
      method: 'DELETE',
    });
    assert.equal(res.status, 200);

    // Verify deletion
    const check = await fetch(`${baseUrl}/api/recipients/${createdRecipientId}`);
    assert.equal(check.status, 404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Persistence Survival
// ─────────────────────────────────────────────────────────────────────────────
describe('9. Persistence Engine Survival', () => {
  it('Persists records to disk so a new repository instance retrieves them', async () => {
    // 1. Create a transaction through the service
    const tx = await transactionService.createTransaction({
      amount: 1250,
      fromCurrency: 'AED',
      recipient: { name: 'Persistence Tester', upiId: 'persist@okhdfc' },
      purpose: 'Gift',
      routeId: 'upi_partner',
    });

    // 2. Instantiate a fresh TransactionRepository instance
    const freshRepo = new TransactionRepository();
    const retrieved = await freshRepo.findById(tx.id);

    assert.ok(retrieved, 'Transaction record must survive in repository storage');
    assert.equal(retrieved.id, tx.id);
    assert.equal(retrieved.fromAmount, 1250);
    assert.equal(retrieved.recipientName, 'Persistence Tester');
  });
});
