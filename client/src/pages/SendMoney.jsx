import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, User, DollarSign, Users, FileText, GitBranch, ShieldCheck, Eye, Send, AlertTriangle, Zap, Globe, Link, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { fxService } from '../services/fxService.js';
import { routeService } from '../services/routeService.js';
import { riskService } from '../services/riskService.js';
import { transactionService } from '../services/transactionService.js';
import { useStore } from '../store/useStore.js';
import clsx from 'clsx';

const STEPS = [
  { id: 1, label: 'Sender',    icon: User },
  { id: 2, label: 'Amount',    icon: DollarSign },
  { id: 3, label: 'Recipient', icon: Users },
  { id: 4, label: 'Purpose',   icon: FileText },
  { id: 5, label: 'Routes',    icon: GitBranch },
  { id: 6, label: 'Risk',      icon: ShieldCheck },
  { id: 7, label: 'Review',    icon: Eye },
];

const PURPOSES = ['Family support', 'Education', 'Medical expenses', 'Business', 'Personal', 'Other'];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={clsx(
              'transition-all duration-300',
              currentStep === step.id ? 'step-active' :
              currentStep > step.id  ? 'step-done' : 'step-pending'
            )}>
              {currentStep > step.id ? <Check size={14} /> : <span className="text-xs">{step.id}</span>}
            </div>
            <span className={clsx('text-[10px] font-semibold hidden sm:block', currentStep === step.id ? 'text-brand-600' : currentStep > step.id ? 'text-emerald-600' : 'text-gray-400')}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={clsx('h-px flex-1 mx-2 mb-4 transition-all', currentStep > step.id ? 'bg-emerald-300' : 'bg-surface-700')} style={{ minWidth: 20 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, loading = false }) {
  return (
    <div className="flex justify-between pt-6 border-t border-surface-700 mt-6">
      {onBack ? (
        <button onClick={onBack} className="btn-secondary">
          <ChevronLeft size={16} /> Back
        </button>
      ) : <div />}
      <button onClick={onNext} disabled={nextDisabled || loading} className="btn-primary">
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Step 1: Sender ────────────────────────────────────────────────────────────
function StepSender({ data, onChange, onNext }) {
  const countries = fxService.getSupportedCountries();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name?.trim()) e.name = 'Required';
    if (!data.email?.trim()) e.email = 'Required';
    if (!data.country) e.country = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Sender Details</h2>
        <p className="text-sm text-gray-400">Enter the details of the person sending money.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Sending From *</label>
          <select className={clsx('select', errors.country && 'border-red-400')}
            value={data.country || ''} onChange={e => {
              const c = countries.find(x => x.code === e.target.value);
              onChange({ country: e.target.value, countryCode: e.target.value, countryName: c?.name, currency: c?.currency, flag: c?.flag });
            }}>
            <option value="">Select country</option>
            {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>
        <div>
          <label className="label">Full Name *</label>
          <input className={clsx('input', errors.name && 'border-red-400')} placeholder="e.g. Arjun Patel"
            value={data.name || ''} onChange={e => onChange({ name: e.target.value })} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="label">Email Address *</label>
          <input className={clsx('input', errors.email && 'border-red-400')} type="email" placeholder="sender@email.com"
            value={data.email || ''} onChange={e => onChange({ email: e.target.value })} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input className="input" placeholder="+971 50 123 4567"
            value={data.phone || ''} onChange={e => onChange({ phone: e.target.value })} />
        </div>
      </div>
      <NavButtons onNext={() => validate() && onNext()} nextLabel="Continue" />
    </div>
  );
}

// ── Step 2: Amount ────────────────────────────────────────────────────────────
function StepAmount({ data, senderCurrency, onChange, onBack, onNext }) {
  const [fxCalc, setFxCalc] = useState(null);

  useEffect(() => {
    if (data.amount && data.currency) {
      try {
        const calc = fxService.calculate(parseFloat(data.amount), data.currency);
        setFxCalc(calc);
        onChange({ fxCalc: calc });
      } catch {}
    }
  }, [data.amount, data.currency]);

  const canContinue = data.amount > 0 && data.currency;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Transfer Amount</h2>
        <p className="text-sm text-gray-400">Enter the amount you want to send. The recipient will receive Indian Rupees (INR).</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Currency</label>
          <select className="select" value={data.currency || senderCurrency || 'AED'}
            onChange={e => onChange({ currency: e.target.value })}>
            {fxService.getSupportedCurrencies().map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Amount to Send *</label>
          <input className="input text-lg font-semibold" type="number" placeholder="0.00" min="1"
            value={data.amount || ''} onChange={e => onChange({ amount: e.target.value })} />
        </div>
      </div>

      {/* FX breakdown */}
      {fxCalc && parseFloat(data.amount) > 0 && (
        <div className="card p-5 border-brand-200 bg-brand-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-100">Exchange Calculation</span>
            <span className="badge-demo">DEMO RATES</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Exchange Rate', `1 ${data.currency} = ₹${fxCalc.clientRate}`],
              ['FX Spread', `₹${fxCalc.fxFeeINR.toLocaleString()}`],
              ['Transfer Fee', `₹${fxCalc.transferFeeINR.toLocaleString()}`],
              ['Total Cost', `₹${fxCalc.totalFeeINR.toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400 font-medium">{k}</span>
                <span className="text-gray-100 font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-200/60 pt-3 flex justify-between items-center">
            <span className="text-sm text-gray-400 font-medium">Recipient Gets</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">₹{fxCalc.netINR.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Estimated — rates may vary</div>
            </div>
          </div>
        </div>
      )}
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}

// ── Step 3: Recipient ─────────────────────────────────────────────────────────
function StepRecipient({ data, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.name?.trim()) e.name = 'Required';
    if (!data.upiId?.trim()) e.upiId = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Recipient Details</h2>
        <p className="text-sm text-gray-400">Who will receive the funds in India?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Recipient Name *</label>
          <input className={clsx('input', errors.name && 'border-red-400')} placeholder="e.g. Priya Sharma"
            value={data.name || ''} onChange={e => onChange({ name: e.target.value })} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="label">Recipient Country</label>
          <input className="input bg-slate-50 font-medium text-gray-200" value="🇮🇳 India" disabled />
        </div>
        <div>
          <label className="label">UPI ID *</label>
          <input className={clsx('input', errors.upiId && 'border-red-400')} placeholder="name@okicici"
            value={data.upiId || ''} onChange={e => onChange({ upiId: e.target.value })} />
          {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
          <p className="text-xs text-gray-400 mt-1">UPI ID enables instant settlement via NPCI/UPI infrastructure</p>
        </div>
        <div>
          <label className="label">Bank Name</label>
          <input className="input" placeholder="e.g. ICICI Bank (optional)"
            value={data.bankName || ''} onChange={e => onChange({ bankName: e.target.value })} />
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={() => validate() && onNext()} />
    </div>
  );
}

// ── Step 4: Purpose ───────────────────────────────────────────────────────────
function StepPurpose({ data, onChange, onBack, onNext }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Purpose of Transfer</h2>
        <p className="text-sm text-gray-400">Required for regulatory compliance. Select the most appropriate option.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PURPOSES.map(p => (
          <button key={p} onClick={() => onChange({ purpose: p })}
            className={clsx(
              'p-4 rounded-xl border text-sm font-semibold text-left transition-all',
              data.purpose === p
                ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-sm'
                : 'bg-white border-surface-700 text-gray-300 hover:border-brand-300 hover:bg-slate-50'
            )}>
            {p}
          </button>
        ))}
      </div>
      {data.purpose && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
          <Check size={16} /> Selected Purpose: <strong>{data.purpose}</strong>
        </div>
      )}
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.purpose} />
    </div>
  );
}

// ── Step 5: Route Comparison ──────────────────────────────────────────────────
function StepRoutes({ amountDetails, selectedRoute, onSelectRoute, onBack, onNext }) {
  const fxCalc = amountDetails.fxCalc;
  const routes = fxCalc ? routeService.analyzeRoutes(amountDetails.amount, amountDetails.currency, fxCalc) : [];
  const recommended = fxCalc ? routeService.recommend(routes, 20) : null;

  const fmtTime = (sec) => {
    if (sec < 120) return `~${sec} sec`;
    if (sec < 7200) return `~${Math.round(sec/60)} min`;
    if (sec < 172800) return `~${Math.round(sec/3600)} hrs`;
    return `${Math.round(sec/86400)} days`;
  };

  const ROUTE_ICON_MAP = { npci: Zap, blockchain: Link, bank: Building2, swift: Globe };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Select Settlement Route</h2>
        <p className="text-sm text-gray-400">Our orchestration engine has analysed available payment rails for this corridor.</p>
      </div>

      {recommended && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-emerald-800">Recommended Route</div>
            <div className="text-sm text-gray-300 mt-0.5">
              <strong className="text-emerald-700">{recommended.name}</strong> — Lower total cost and faster settlement
              while maintaining an optimal risk profile for this corridor.
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {routes.map(route => {
          const Icon = ROUTE_ICON_MAP[route.id] || Globe;
          const isRec = recommended?.id === route.id;
          const isSelected = selectedRoute?.id === route.id;
          return (
            <div key={route.id}
              onClick={() => onSelectRoute(route)}
              className={clsx(
                'card p-4 cursor-pointer transition-all duration-150',
                isSelected ? 'border-brand-500 bg-brand-50/50 shadow-md ring-1 ring-brand-500' : 'hover:border-slate-300 hover:bg-slate-50/50',
              )}>
              <div className="flex items-start gap-4">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm', isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-100">{route.name}</span>
                    {isRec && <span className="badge-success text-[10px]">✓ RECOMMENDED</span>}
                    {route.badge === 'TESTNET' && <span className="badge-demo">TESTNET</span>}
                    {route.availability !== 'operational' && route.availability !== 'testnet' && (
                      <span className="badge-neutral">{route.availability}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{route.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {[
                      ['Cost', `₹${route.costINR?.toLocaleString() || '—'}`],
                      ['Speed', fmtTime(route.speedSec)],
                      ['Reliability', `${route.reliability}%`],
                      ['Risk', route.riskLevel],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{k}</div>
                        <div className={clsx('text-sm font-bold mt-0.5',
                          k === 'Risk' && v === 'LOW' ? 'text-emerald-700' :
                          k === 'Risk' && v === 'MEDIUM' ? 'text-amber-700' :
                          k === 'Risk' ? 'text-red-700' : 'text-gray-100'
                        )}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1', isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300')}>
                  {isSelected && <Check size={11} className="text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!selectedRoute} nextLabel="Run Risk Check" />
    </div>
  );
}

// ── Step 6: Risk ──────────────────────────────────────────────────────────────
function StepRisk({ senderDetails, amountDetails, recipientDetails, purposeDetails, riskResult, onRiskResult, onBack, onNext }) {
  useEffect(() => {
    if (!riskResult) {
      const result = riskService.analyze({
        fromAmount: amountDetails.amount,
        fromCurrency: amountDetails.currency,
        recipientUpi: recipientDetails.upiId,
        purpose: purposeDetails.purpose,
        corridor: `${senderDetails.countryCode}_INR`,
      });
      onRiskResult(result);
    }
  }, []);

  if (!riskResult) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;

  const scoreColor = riskResult.score < 30 ? 'text-emerald-700' : riskResult.score < 65 ? 'text-amber-700' : 'text-red-700';
  const scoreBg = riskResult.score < 30 ? 'bg-emerald-500' : riskResult.score < 65 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100 mb-1">Risk Assessment</h2>
          <p className="text-sm text-gray-400">Demo analysis of transaction risk factors.</p>
        </div>
        <span className="badge-demo">DEMO RISK ANALYSIS</span>
      </div>

      {/* Score */}
      <div className="card p-6 text-center">
        <div className={clsx('text-5xl font-bold mono mb-1', scoreColor)}>{riskResult.score}</div>
        <div className="text-gray-400 text-sm font-medium mb-4">Risk Score / 100 — <strong className={scoreColor}>{riskResult.level} RISK</strong></div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={clsx('h-full rounded-full transition-all duration-1000', scoreBg)} style={{ width: `${riskResult.score}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1 px-1">
          <span>LOW</span><span>MEDIUM</span><span>HIGH</span>
        </div>
      </div>

      {/* Signals */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-100 mb-3">Risk Factors Analysed</h3>
        <ul className="space-y-2">
          {riskResult.signals.map((s, i) => (
            <li key={i} className={clsx('flex items-start gap-3 text-sm', s.flag ? 'text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200' : 'text-gray-300')}>
              <span className={clsx('mt-0.5 text-base leading-none font-bold', s.flag ? 'text-amber-600' : 'text-emerald-600')}>
                {s.flag ? '⚠' : '✓'}
              </span>
              <span className="font-medium">{s.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {riskResult.requiresReview && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Manual Review Required</strong> — This transaction will be placed in the compliance review queue before settlement.
          </div>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review & Confirm" />
    </div>
  );
}

// ── Step 7: Review & Confirm ──────────────────────────────────────────────────
function StepReview({ senderDetails, amountDetails, recipientDetails, purposeDetails, selectedRoute, riskResult, onBack, onConfirm, confirming }) {
  const fxCalc = amountDetails.fxCalc;
  const fmtTime = (sec) => sec < 120 ? `~${sec} sec` : sec < 7200 ? `~${Math.round(sec/60)} min` : `${Math.round(sec/86400)} days`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-100 mb-1">Review & Confirm</h2>
        <p className="text-sm text-gray-400">Please review all details carefully before confirming this demo transfer.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Summary card */}
        <div className="card p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Transfer Summary</h3>
          {[
            ['Sending', `${parseFloat(amountDetails.amount).toLocaleString()} ${amountDetails.currency}`],
            ['From', `${senderDetails.flag} ${senderDetails.name}, ${senderDetails.countryName}`],
            ['To', `${recipientDetails.name} (${recipientDetails.upiId})`],
            ['Recipient gets', fxCalc ? `₹${fxCalc.netINR.toLocaleString()}` : '—'],
            ['Exchange rate', fxCalc ? `1 ${amountDetails.currency} = ₹${fxCalc.clientRate}` : '—'],
            ['Total fees', fxCalc ? `₹${fxCalc.totalFeeINR.toLocaleString()}` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">{k}</span>
              <span className="text-gray-100 font-bold text-right max-w-[55%]">{v}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* Route */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Settlement Route</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-700">{selectedRoute?.name}</span>
              {selectedRoute?.badge === 'TESTNET' && <span className="badge-demo">TESTNET</span>}
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1">Est. settlement: {fmtTime(selectedRoute?.speedSec)}</div>
          </div>
          {/* Risk */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Risk Assessment</h3>
            <div className={clsx('font-bold', riskResult?.level === 'LOW' ? 'text-emerald-700' : riskResult?.level === 'MEDIUM' ? 'text-amber-700' : 'text-red-700')}>
              {riskResult?.score} / 100 — {riskResult?.level}
            </div>
            {riskResult?.requiresReview && <div className="text-xs text-amber-700 font-semibold mt-1">⚠ Manual review required</div>}
          </div>
          {/* Purpose */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Purpose</h3>
            <div className="text-gray-100 font-semibold text-sm">{purposeDetails.purpose}</div>
          </div>
        </div>
      </div>

      {/* Demo disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-amber-800">DEMO TRANSFER</strong> — Clicking confirm will create a simulated transaction in the demo system.
          No real funds will be moved. Mock payment APIs are in use.
        </span>
      </div>

      <NavButtons onBack={onBack} onNext={onConfirm} nextLabel="Confirm Demo Transfer" loading={confirming} />
    </div>
  );
}

// ── Main SendMoney Component ───────────────────────────────────────────────────
export default function SendMoney() {
  const navigate = useNavigate();
  const addTransaction = useStore(s => s.addTransaction);

  const [step, setStep] = useState(1);
  const [senderDetails, setSenderDetails] = useState({});
  const [amountDetails, setAmountDetails] = useState({ currency: 'AED' });
  const [recipientDetails, setRecipientDetails] = useState({});
  const [purposeDetails, setPurposeDetails] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1200));
    const tx = transactionService.buildTransaction({
      senderDetails, amountDetails, recipientDetails, purposeDetails, selectedRoute,
      fxCalc: amountDetails.fxCalc, risk: riskResult,
    });
    addTransaction(tx);
    setConfirming(false);
    navigate(`/transactions/${tx.id}?new=1`);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="card p-6 sm:p-8 bg-white border border-surface-700 shadow-card">
        <StepIndicator currentStep={step} />
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            {step === 1 && <StepSender data={senderDetails} onChange={d => setSenderDetails(p => ({ ...p, ...d }))} onNext={() => setStep(2)} />}
            {step === 2 && <StepAmount data={amountDetails} senderCurrency={senderDetails.currency} onChange={d => setAmountDetails(p => ({ ...p, ...d }))} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
            {step === 3 && <StepRecipient data={recipientDetails} onChange={d => setRecipientDetails(p => ({ ...p, ...d }))} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
            {step === 4 && <StepPurpose data={purposeDetails} onChange={d => setPurposeDetails(p => ({ ...p, ...d }))} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
            {step === 5 && <StepRoutes senderDetails={senderDetails} amountDetails={amountDetails} recipientDetails={recipientDetails} selectedRoute={selectedRoute} onSelectRoute={setSelectedRoute} onBack={() => setStep(4)} onNext={() => setStep(6)} />}
            {step === 6 && <StepRisk senderDetails={senderDetails} amountDetails={amountDetails} recipientDetails={recipientDetails} purposeDetails={purposeDetails} riskResult={riskResult} onRiskResult={setRiskResult} onBack={() => setStep(5)} onNext={() => setStep(7)} />}
            {step === 7 && <StepReview senderDetails={senderDetails} amountDetails={amountDetails} recipientDetails={recipientDetails} purposeDetails={purposeDetails} selectedRoute={selectedRoute} riskResult={riskResult} onBack={() => setStep(6)} onConfirm={handleConfirm} confirming={confirming} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
