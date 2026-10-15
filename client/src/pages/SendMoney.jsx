import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { fxService } from '../services/fxService.js';
import { routeService } from '../services/routeService.js';
import { transactionService } from '../services/transactionService.js';

const STEP_LABELS = ['Details', 'Cost', 'Routes', 'Review', 'Track'];
const CTA_LABELS = [
  'Continue',
  'See routes',
  'Review transfer',
  'Create simulated transfer',
  'Done — back to overview',
];

const PURPOSES = ['Family support', 'Education', 'Medical expenses', 'Gift'];

export default function SendMoney() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);
  const recipients = useStore(s => s.recipients);
  const addTransaction = useStore(s => s.addTransaction);

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('5000.00');
  const [currency, setCurrency] = useState('AED');
  const [selectedRecipientId, setSelectedRecipientId] = useState(recipients[0]?.id || 'rec-001');
  const [purpose, setPurpose] = useState('Family support');
  const [selectedRouteId, setSelectedRouteId] = useState('upi_partner');
  const [acknowledged, setAcknowledged] = useState(false);
  const [createdTx, setCreatedTx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const idempotencyKeyRef = useRef(null);

  // Quote timer state (300 seconds = 5 min)
  const [quoteSeconds, setQuoteSeconds] = useState(299);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);

  // Initialize idempotency key when entering Step 4
  useEffect(() => {
    if (step === 4 && !idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    if (step < 4) {
      idempotencyKeyRef.current = null;
      setSubmitError(null);
    }
  }, [step]);

  useEffect(() => {
    if (isQuoteExpired || step === 5) return;
    const interval = setInterval(() => {
      setQuoteSeconds((prev) => {
        if (prev <= 1) {
          setIsQuoteExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuoteExpired, step]);

  const handleRefreshQuote = () => {
    setQuoteSeconds(299);
    setIsQuoteExpired(false);
  };

  const timerFormatted = useMemo(() => {
    const m = Math.floor(quoteSeconds / 60);
    const s = quoteSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [quoteSeconds]);

  // Selected recipient
  const selectedRecipient = useMemo(() => {
    return recipients.find(r => r.id === selectedRecipientId) || recipients[0] || {
      name: 'Anita Sharma',
      phoneMask: '•••• 4821',
      upiId: 'anita.sharma@okaxis',
      bankName: 'Axis Bank',
    };
  }, [recipients, selectedRecipientId]);

  // Amount validation (AED 100 to 10,000)
  const numericAmount = parseFloat(amount);
  const amountValidation = useMemo(() => {
    if (isNaN(numericAmount) || amount.trim() === '') {
      return { valid: false, message: 'Enter an amount in AED.' };
    }
    if (numericAmount < 100) {
      return { valid: false, message: 'Minimum is AED 100.' };
    }
    if (numericAmount > 10000) {
      return { valid: false, message: 'Maximum is AED 10,000 on this corridor.' };
    }
    return { valid: true, message: 'Limits on this corridor (demo): AED 100 – 10,000 per transfer.' };
  }, [amount, numericAmount]);

  // Analyzed routes for current amount
  const analyzedRoutes = useMemo(() => {
    return routeService.analyzeRoutes(amountValidation.valid ? numericAmount : 5000, currency);
  }, [numericAmount, currency, amountValidation.valid]);

  // Current active route
  const currentRoute = useMemo(() => {
    return analyzedRoutes.find(r => r.id === selectedRouteId) || analyzedRoutes[0];
  }, [analyzedRoutes, selectedRouteId]);

  // Dynamic recommendation rationale
  const recommendation = useMemo(() => {
    return routeService.getRecommendation(analyzedRoutes, selectedRecipient.name);
  }, [analyzedRoutes, selectedRecipient]);

  // Financial calculations for current selected route
  const fxCalc = useMemo(() => {
    return fxService.calculate({
      fromAmount: amountValidation.valid ? numericAmount : 5000,
      fromCurrency: currency,
      route: currentRoute,
    });
  }, [numericAmount, currency, currentRoute, amountValidation.valid]);

  // Step progression validation
  const canContinue = useMemo(() => {
    if (step === 1) return amountValidation.valid;
    if (step === 2) return !isQuoteExpired;
    if (step === 3) return currentRoute && currentRoute.isAvailable;
    if (step === 4) return acknowledged && !isQuoteExpired && !isSubmitting;
    return true;
  }, [step, amountValidation.valid, isQuoteExpired, currentRoute, acknowledged, isSubmitting]);

  // Handle CTA button click
  const handleContinue = async () => {
    if (step === 1) {
      if (!amountValidation.valid) return;
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      if (isQuoteExpired) return;
      setStep(3);
      window.scrollTo(0, 0);
    } else if (step === 3) {
      setStep(4);
      window.scrollTo(0, 0);
    } else if (step === 4) {
      if (!acknowledged || isQuoteExpired || isSubmitting) return;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const payload = {
          amount: numericAmount,
          fromCurrency: currency,
          recipientId: selectedRecipient.id,
          recipient: selectedRecipient,
          purpose,
          routeId: currentRoute.id,
          senderName: 'Arjun Patel',
          senderCountry: 'United Arab Emirates',
          senderCountryCode: 'AE',
        };
        const created = await addTransaction(payload, idempotencyKeyRef.current);
        setCreatedTx(created);
        setStep(5);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Failed to create transaction on server:', err);
        setSubmitError(err.message || 'Server transfer submission failed. Please retry.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 5) {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 5) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-serif text-[28px] text-ink font-semibold">Send money to India</h1>
        <p className="text-mute text-sm mt-0.5">
          Compare routes, see every cost, then confirm. <span className="demo">SIMULATED TRANSFER</span>
        </p>
      </div>

      {/* Stepper Progress */}
      <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm border-b border-rule pb-3" aria-label="Progress">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isCurrent = stepNum === step;
          const isCompleted = stepNum < step;
          return (
            <li
              key={label}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center gap-1.5 ${
                isCurrent ? 'font-semibold text-ink' : 'text-mute'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full border ${
                  isCurrent
                    ? 'bg-acc text-white border-acc font-semibold'
                    : isCompleted
                    ? 'bg-oksoft text-ok border-ok/30 font-semibold'
                    : 'border-rule text-mute'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="lg:grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Step Body */}
        <div>
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-ink font-semibold">1. Transfer details</h2>
              <form className="grid sm:grid-cols-2 gap-4 bg-white border border-rule rounded p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="lbl" htmlFor="country-select">Sending from</label>
                  <select id="country-select" className="field" defaultValue="United Arab Emirates">
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>
                <div>
                  <label className="lbl" htmlFor="currency-select">Sending currency</label>
                  <select
                    id="currency-select"
                    className="field"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="AED">AED — UAE dirham</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="lbl" htmlFor="amount-input">You send</label>
                  <div className="flex">
                    <span className="px-3.5 flex items-center border border-r-0 border-[#B9B2A3] rounded-l bg-canvas text-sm font-semibold text-ink">
                      AED
                    </span>
                    <input
                      id="amount-input"
                      className="field num rounded-l-none"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      aria-describedby="amtmsg"
                    />
                  </div>
                  <p
                    id="amtmsg"
                    className={`text-sm mt-1.5 ${
                      amountValidation.valid ? 'text-mute' : 'text-bad font-medium'
                    }`}
                    aria-live="polite"
                  >
                    {!amountValidation.valid && <span className="mr-1">✕</span>}
                    {amountValidation.message}
                  </p>
                </div>
                <div>
                  <label className="lbl" htmlFor="recipient-select">Recipient</label>
                  <select
                    id="recipient-select"
                    className="field"
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                  >
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} · {r.phoneMask || r.upiId} · UPI
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl" htmlFor="purpose-select">Purpose of transfer</label>
                  <select
                    id="purpose-select"
                    className="field"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-ink font-semibold">2. What it costs</h2>
              <div className="bg-white border border-rule rounded p-4 sm:p-6">
                <p className="text-sm text-mute">{selectedRecipient.name} receives (estimated)</p>
                <p className="font-serif text-[44px] leading-tight num font-semibold text-ink my-1">
                  {fxService.formatINR(fxCalc.recipientINR)}
                </p>
                <p className="text-sm text-mute mb-4">
                  Based on the {currentRoute.name.toLowerCase()} · arrives in {currentRoute.eta} (simulated estimate)
                </p>

                <dl className="divide-y divide-rule">
                  <div className="row">
                    <dt>You send</dt>
                    <dd>{fxService.formatAED(fxCalc.fromAmount)}</dd>
                  </div>
                  <div className="row">
                    <dt>Transfer fee</dt>
                    <dd>− {fxService.formatAED(fxCalc.feeAED)}</dd>
                  </div>
                  <div className="row">
                    <dt>Amount converted</dt>
                    <dd>{fxService.formatAED(fxCalc.convertedAmount)}</dd>
                  </div>
                  <div className="row">
                    <dt>Rate we apply</dt>
                    <dd>1 AED = ₹{fxCalc.appliedRate.toFixed(2)}</dd>
                  </div>
                  <div className="row">
                    <dt>Mid-market rate <span className="text-xs text-mute">(for reference)</span></dt>
                    <dd>1 AED = ₹{fxCalc.midRate.toFixed(2)}</dd>
                  </div>
                  <div className="row">
                    <dt>
                      FX conversion cost
                      <span className="text-xs block text-mute">
                        {fxCalc.fxSpreadPct}% gap between our rate and mid-market
                      </span>
                    </dt>
                    <dd>{fxService.formatAED(fxCalc.fxCostAED)}</dd>
                  </div>
                  <div className="row">
                    <dt>Other fees</dt>
                    <dd>AED 0.00</dd>
                  </div>
                  <div className="row font-semibold" style={{ borderBottom: '2px solid #16233B' }}>
                    <dt className="!text-ink font-semibold">Total cost to you</dt>
                    <dd className="font-semibold text-ink">
                      {fxService.formatAED(fxCalc.totalCostAED)} ({fxCalc.totalCostPct}%)
                    </dd>
                  </div>
                </dl>

                {/* Quote countdown & rate hold status */}
                <div className="mt-4 pt-2 flex flex-wrap gap-2 items-center text-sm" aria-live="polite">
                  {!isQuoteExpired ? (
                    <>
                      <span className="chip bg-infosoft text-info">◔ Rate held</span>
                      <span className="num font-mono font-medium">{timerFormatted}</span>
                      <span className="text-mute">
                        · rates are simulated for this demo. If the timer ends we will ask you to refresh the quote.
                      </span>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between p-3 bg-badsoft border border-bad/30 rounded text-bad">
                      <span>✕ Rate guarantee expired. Please refresh to lock in the latest rates.</span>
                      <button
                        onClick={handleRefreshQuote}
                        className="btn btn-p text-xs py-1.5 px-3 min-h-[32px]"
                      >
                        Refresh quote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-ink font-semibold">3. Compare routes</h2>

              {/* Strategy Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-rule rounded">
                <span className="text-xs text-mute font-medium">Routing Priority:</span>
                <div className="flex gap-2">
                  {['DEFAULT', 'CHEAPEST', 'FASTEST'].map((strat) => (
                    <button
                      key={strat}
                      type="button"
                      className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                        (recommendation?.strategy || 'DEFAULT') === strat
                          ? 'bg-ink text-white border-ink'
                          : 'bg-canvas text-mute border-rule hover:text-ink'
                      }`}
                    >
                      {strat === 'DEFAULT' ? 'Balanced' : strat === 'CHEAPEST' ? 'Lowest Cost' : 'Fastest SLA'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation Callout */}
              {recommendation && (
                <div className="bg-accsoft border border-acc rounded p-4 mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{recommendation.title}</p>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/80 text-acc border border-acc/30">
                      LIVE ORCHESTRATION
                    </span>
                  </div>
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-ink">
                    {recommendation.bullets.map((b, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: b.replace(/(Costs AED [\d.]+|[\d.]+ pt|\b\d+ minutes|\b₹[\d.]+)/g, '<strong>$1</strong>') }} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Route Selection */}
              <fieldset className="space-y-3">
                <legend className="sr-only">Choose a route</legend>

                {analyzedRoutes.map((route) => {
                  if (!route.isAvailable) {
                    return (
                      <div key={route.id} className="route disabled" aria-disabled="true">
                        <div className="grid sm:grid-cols-[1.4fr_3fr] gap-3">
                          <div>
                            <span className="chip bg-canvas text-mute border border-rule mb-1">
                              ✕ Not available
                            </span>
                            <p className="font-semibold text-mute">{route.name}</p>
                            <span className="text-[10px] font-mono text-mute block mt-1">PROVENANCE: {route.provenance || 'UNAVAILABLE'}</span>
                          </div>
                          <p className="text-sm text-mute self-center">
                            {route.unavailableReason}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const isSelected = selectedRouteId === route.id;
                  const isRec = route.badge === 'RECOMMENDED';
                  const isLowest = route.badge === 'LOWEST_COST';
                  const isDegraded = route.badge === 'DEGRADED';

                  return (
                    <label
                      key={route.id}
                      className={`route ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedRouteId(route.id)}
                    >
                      <input
                        type="radio"
                        name="remit_route"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => setSelectedRouteId(route.id)}
                      />
                      <div className="grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 items-start">
                        <div>
                          {isRec && <span className="chip bg-acc text-white mb-1">★ Recommended</span>}
                          {isLowest && <span className="chip bg-canvas text-ink border border-rule mb-1">Lowest cost</span>}
                          {isDegraded && <span className="chip bg-warnsoft text-warn mb-1">▲ Degraded</span>}
                          <p className="font-semibold text-ink">{route.name}</p>
                          <p className="text-sm text-mute">{route.subtext}</p>
                          <span className="text-[10px] font-mono text-mute block mt-1">
                            PROVENANCE: {route.provenance || 'CONFIGURED_ESTIMATE'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-mute">Recipient gets</p>
                          <p className="font-serif text-xl num font-semibold text-ink">
                            {route.recipientINRFormatted}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-mute">Total cost</p>
                          <p className="num font-medium text-ink">{route.totalCostFormatted}</p>
                          <p className="text-xs text-mute">Fee {route.calc.feeAED.toFixed(2)} + FX {route.calc.fxCostAED.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-mute">Arrives</p>
                          <p className="font-medium text-ink">{route.eta}</p>
                          <p className={`text-xs ${isDegraded ? 'text-warn' : isLowest ? 'text-warn' : 'text-ok'}`}>
                            {isDegraded || isLowest ? '▲ ' : ''}Reliability {route.reliability}% · Available
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </fieldset>

              <p className="text-xs text-mute mt-3 leading-relaxed">
                Blockchain settlement is a way a rail settles. It does not make a route cheaper, faster or safer by itself, so it is judged on the same numbers as the others. All figures are simulated.
              </p>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-ink font-semibold">4. Review &amp; confirm</h2>

              {/* Pre-flight Checks */}
              <section className="bg-white border border-rule rounded p-4 sm:p-6 mb-4" aria-labelledby="chk">
                <h3 id="chk" className="font-semibold text-ink mb-2">
                  Checks before you send <span className="demo ml-1">SIMULATED</span>
                </h3>
                <ul className="divide-y divide-rule text-sm">
                  <li className="py-3 flex gap-3 items-start">
                    <span className="chip bg-oksoft text-ok shrink-0">✓ Passed</span>
                    <span className="text-ink">Amount is within corridor limits (AED 100 – 10,000).</span>
                  </li>
                  <li className="py-3 flex gap-3 items-start">
                    <span className="chip bg-oksoft text-ok shrink-0">✓ Passed</span>
                    <span className="text-ink">
                      Recipient UPI ID is active and matches the name "{selectedRecipient.name}".
                    </span>
                  </li>
                  <li className="py-3 flex gap-3 items-start">
                    <span className="chip bg-oksoft text-ok shrink-0">✓ Passed</span>
                    <span className="text-ink">Purpose "{purpose}" is permitted for this corridor.</span>
                  </li>
                  <li className="py-3 flex gap-3 items-start">
                    <span className="chip bg-infosoft text-info shrink-0">ⓘ Note</span>
                    <span className="text-mute">
                      If a check flags this transfer after you confirm, we will tell you what is needed. Nothing is hidden or silently held.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Summary details */}
              <section className="bg-white border border-rule rounded p-4 sm:p-6">
                <h3 className="font-semibold text-ink mb-1">Summary</h3>
                <dl className="divide-y divide-rule">
                  <div className="row">
                    <dt>To</dt>
                    <dd>{selectedRecipient.name} · UPI {selectedRecipient.phoneMask || selectedRecipient.upiId}</dd>
                  </div>
                  <div className="row">
                    <dt>Purpose</dt>
                    <dd>{purpose}</dd>
                  </div>
                  <div className="row">
                    <dt>Route</dt>
                    <dd>{currentRoute.name}</dd>
                  </div>
                  <div className="row">
                    <dt>You send</dt>
                    <dd>{fxService.formatAED(fxCalc.fromAmount)}</dd>
                  </div>
                  <div className="row">
                    <dt>Total cost</dt>
                    <dd>{fxService.formatAED(fxCalc.totalCostAED)}</dd>
                  </div>
                  <div className="row">
                    <dt>Rate</dt>
                    <dd>1 AED = ₹{fxCalc.appliedRate.toFixed(2)}</dd>
                  </div>
                  <div className="row">
                    <dt>Estimated arrival</dt>
                    <dd>{currentRoute.eta}</dd>
                  </div>
                  <div className="row font-semibold">
                    <dt className="!text-ink font-semibold">Recipient gets</dt>
                    <dd className="font-semibold text-ink text-base">{fxService.formatINR(fxCalc.recipientINR)}</dd>
                  </div>
                </dl>

                {/* Acknowledgment Checkbox */}
                <label className="flex gap-3 items-start text-sm mt-5 pt-3 border-t border-rule cursor-pointer">
                  <input
                    id="ack-checkbox"
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-0.5 w-5 h-5 accent-[#0E6B62] rounded cursor-pointer"
                  />
                  <span className="text-ink">
                    I understand this is a <strong>simulated transfer</strong> in a demo environment and no real money will move.
                  </span>
                </label>

                {/* Submission Error Banner */}
                {submitError && (
                  <div className="mt-4 p-3.5 bg-badsoft border border-bad/30 rounded text-bad text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2" role="alert">
                    <div>
                      <strong>Transfer Submission Failed:</strong> {submitError}
                    </div>
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={isSubmitting}
                      className="btn btn-p text-xs py-1 px-3 self-start sm:self-auto shrink-0"
                    >
                      Retry submission
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ================= STEP 5 ================= */}
          {step === 5 && createdTx && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-ink font-semibold">5. Track your transfer</h2>

              <div className="bg-infosoft border border-info rounded p-4 text-info text-sm" role="status">
                <strong>◔ Simulated transfer created.</strong> No money has moved and nothing has settled. This record exists only in the demo.
              </div>

              {/* Transfer Summary Card */}
              <div className="bg-white border border-rule rounded p-4 sm:p-6">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <p className="font-mono text-sm font-semibold text-ink">{createdTx.id}</p>
                  <span className="chip bg-warnsoft text-warn">◔ Processing (simulated)</span>
                </div>
                <p className="text-sm text-mute">Recipient gets (estimated)</p>
                <p className="font-serif text-[36px] num font-semibold text-ink my-1">
                  {fxService.formatINR(createdTx.toAmount)}
                </p>
                <p className="text-sm text-mute">
                  From {fxService.formatAED(createdTx.fromAmount)} · {createdTx.routeName} · estimated arrival {createdTx.settlementTimeLabel}
                </p>
              </div>

              {/* Event Timeline */}
              <ol className="bg-white border border-rule rounded p-4 sm:p-6 space-y-4 text-sm" aria-label="Transaction timeline">
                <li className="flex gap-3 items-start">
                  <span className="chip bg-oksoft text-ok shrink-0">✓ Done</span>
                  <div>
                    <p className="font-medium text-ink">Transfer created</p>
                    <p className="text-mute">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · quote and route locked</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="chip bg-oksoft text-ok shrink-0">✓ Done</span>
                  <div>
                    <p className="font-medium text-ink">Checks passed (simulated)</p>
                    <p className="text-mute">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="chip bg-warnsoft text-warn shrink-0">◔ Now</span>
                  <div>
                    <p className="font-medium text-ink">Routing to partner rail</p>
                    <p className="text-mute">Usually under 10 minutes. We will flag it here if it takes longer.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="chip bg-canvas text-mute border border-rule shrink-0">○ Next</span>
                  <div>
                    <p className="font-medium text-mute">Settlement &amp; delivery to recipient</p>
                  </div>
                </li>
              </ol>

              {/* Technical Details Accordion */}
              <details className="bg-white border border-rule rounded p-4 text-sm">
                <summary className="font-medium text-ink cursor-pointer select-none">Technical details</summary>
                <dl className="mt-2 divide-y divide-rule">
                  <div className="row">
                    <dt>Settlement reference</dt>
                    <dd className="font-mono">Not issued (simulated)</dd>
                  </div>
                  <div className="row">
                    <dt>On-chain record</dt>
                    <dd className="font-mono text-xs">
                      {createdTx.blockchainTxHash ? createdTx.blockchainTxHash : 'None for this route'}
                    </dd>
                  </div>
                  <div className="row">
                    <dt>Data source</dt>
                    <dd><span className="demo">DEMO</span></dd>
                  </div>
                </dl>
              </details>
            </div>
          )}

          {/* Desktop Back button row */}
          {step > 1 && step < 5 && (
            <div className="mt-6 hidden lg:flex gap-3">
              <button onClick={handleBack} className="btn btn-s">
                Back
              </button>
            </div>
          )}
        </div>

        {/* Pinned summary rail (bottom bar on mobile, sticky rail on desktop) */}
        <aside
          className="fixed bottom-0 inset-x-0 z-10 bg-white border-t border-rule p-4 shadow-[0_-4px_12px_rgba(22,35,59,.08)] lg:static lg:border lg:rounded lg:shadow-none lg:sticky lg:top-6"
          aria-label="Transfer summary"
        >
          <div className="flex lg:block items-center justify-between gap-4">
            <div>
              <p className="text-xs text-mute">Recipient gets</p>
              <p className="font-serif text-2xl lg:text-[32px] num font-semibold leading-tight text-ink">
                {fxService.formatINR(fxCalc.recipientINR)}
              </p>
            </div>
            <dl className="hidden lg:block text-sm mt-3 divide-y divide-rule">
              <div className="row">
                <dt>You send</dt>
                <dd>{fxService.formatAED(fxCalc.fromAmount)}</dd>
              </div>
              <div className="row">
                <dt>Total cost</dt>
                <dd>{fxService.formatAED(fxCalc.totalCostAED)}</dd>
              </div>
              <div className="row">
                <dt>Rate</dt>
                <dd>1 AED = ₹{fxCalc.appliedRate.toFixed(2)}</dd>
              </div>
              <div className="row">
                <dt>Arrives</dt>
                <dd>{currentRoute.eta}</dd>
              </div>
              <div className="row">
                <dt>Route</dt>
                <dd>{currentRoute.shortName}</dd>
              </div>
            </dl>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="btn btn-p lg:w-full lg:mt-4 whitespace-nowrap"
            >
              {step === 4 && isSubmitting ? 'Initiating transfer...' : CTA_LABELS[step - 1]}
            </button>
          </div>
          <p className="hidden lg:block text-xs text-mute mt-3">
            <span className="demo">DEMO</span> Rates and routes are simulated.
          </p>
        </aside>
      </div>
    </div>
  );
}

