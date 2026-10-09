import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { StatusBadge, RouteBadge, RiskBadge } from '../components/common/StatusBadge.jsx';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, Circle, Loader2, AlertTriangle, ExternalLink, Download, Send, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const ROUTE_LABELS = { npci: 'UPI / NPCI', swift: 'SWIFT', blockchain: 'Blockchain', bank: 'Bank Transfer' };

function getTimelineSteps(tx) {
  const s = tx.status;
  const isDone = (st) => {
    const order = [
      TRANSACTION_STATUS.PENDING,
      TRANSACTION_STATUS.COMPLIANCE_REVIEW,
      TRANSACTION_STATUS.ROUTE_SELECTED,
      TRANSACTION_STATUS.PROCESSING,
      TRANSACTION_STATUS.SETTLEMENT_PENDING,
      TRANSACTION_STATUS.COMPLETED,
    ];
    const curIdx = order.indexOf(s);
    const stIdx = order.indexOf(st);
    return stIdx < curIdx || s === TRANSACTION_STATUS.COMPLETED;
  };

  const steps = [
    { label: 'Initiated', desc: 'Transfer request received', status: 'done' },
    { label: 'Verification', desc: 'Sender & recipient details verified', status: isDone(TRANSACTION_STATUS.COMPLIANCE_REVIEW) ? 'done' : s === TRANSACTION_STATUS.COMPLIANCE_REVIEW ? 'active' : s === TRANSACTION_STATUS.RISK_FLAGGED ? 'warning' : s === TRANSACTION_STATUS.COMPLIANCE_REJECTED ? 'error' : 'pending' },
    { label: 'Risk Assessment', desc: `Risk score: ${tx.riskScore}/100 — ${tx.riskLevel}`, status: isDone(TRANSACTION_STATUS.ROUTE_SELECTED) ? 'done' : s === TRANSACTION_STATUS.RISK_FLAGGED ? 'warning' : 'pending' },
    { label: 'Route Selected', desc: `${ROUTE_LABELS[tx.route] || tx.route} rail selected`, status: isDone(TRANSACTION_STATUS.PROCESSING) ? 'done' : s === TRANSACTION_STATUS.ROUTE_SELECTED ? 'active' : 'pending' },
    { label: 'Settlement', desc: 'Funds being transferred via selected rail', status: s === TRANSACTION_STATUS.COMPLETED ? 'done' : s === TRANSACTION_STATUS.PROCESSING ? 'active' : s === TRANSACTION_STATUS.SETTLEMENT_PENDING ? 'active' : s === TRANSACTION_STATUS.FAILED ? 'error' : 'pending' },
    { label: 'Recipient Credited', desc: tx.status === TRANSACTION_STATUS.COMPLETED ? `₹${tx.toAmount.toLocaleString()} delivered` : 'Awaiting settlement', status: s === TRANSACTION_STATUS.COMPLETED ? 'done' : 'pending' },
  ];
  return steps;
}

function TimelineDot({ status }) {
  if (status === 'done') return <CheckCircle2 size={20} className="text-emerald-600" />;
  if (status === 'active') return <Loader2 size={20} className="text-brand-600 animate-spin" />;
  if (status === 'warning') return <AlertTriangle size={20} className="text-amber-600" />;
  if (status === 'error') return <AlertTriangle size={20} className="text-red-600" />;
  return <Circle size={20} className="text-gray-400" />;
}

export default function TransactionDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const getTransaction = useStore(s => s.getTransaction);
  const updateTransaction = useStore(s => s.updateTransaction);

  const isNew = searchParams.get('new') === '1';
  const tx = getTransaction(id);

  // Simulate settlement progress for new / processing transactions
  useEffect(() => {
    if (!tx) return;
    if (tx.status === TRANSACTION_STATUS.PROCESSING) {
      const timer = setTimeout(() => {
        updateTransaction(id, {
          status: TRANSACTION_STATUS.COMPLETED,
          settlementTime: tx.route === 'npci' ? 30 : tx.route === 'blockchain' ? 15 : 300,
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [tx?.status]);

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="mb-4">Transaction not found: {id}</p>
        <button onClick={() => navigate('/transactions')} className="btn-secondary">Back to Transactions</button>
      </div>
    );
  }

  const timeline = getTimelineSteps(tx);
  const copyId = () => {
    navigator.clipboard.writeText(tx.id);
    toast.success('Transaction ID copied!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/transactions')} className="btn-ghost">
          <ArrowLeft size={16} /> Transactions
        </button>
      </div>

      {/* Success banner for new transactions */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-emerald-800 text-lg">Transfer Initiated!</div>
            <div className="text-sm text-gray-400 mt-0.5 font-medium">Your demo transfer has been created and is now processing.</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-semibold text-brand-700">{tx.id}</div>
            <button onClick={copyId} className="text-xs text-gray-400 hover:text-gray-100 flex items-center gap-1 mt-1 ml-auto font-medium">
              <Copy size={11} /> Copy ID
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary */}
          <div className="card p-5 bg-white border border-surface-700 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-700 text-sm">{tx.id}</span>
                  <button onClick={copyId}><Copy size={12} className="text-gray-400 hover:text-gray-100" /></button>
                </div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{format(new Date(tx.date), 'PPpp')}</div>
              </div>
              <StatusBadge status={tx.status} />
            </div>

            <div className="flex items-center gap-6 py-4 border-y border-surface-700 my-4 bg-slate-50/50 rounded-lg px-3">
              <div className="text-center flex-1">
                <div className="text-xs text-gray-400 font-semibold mb-1">{tx.senderName}</div>
                <div className="text-2xl font-bold text-gray-100">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</div>
                <div className="text-xs text-gray-400 mt-1 font-medium">{tx.senderCountry}</div>
              </div>
              <div className="flex-shrink-0 text-gray-400">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-px bg-surface-700" />
                  <RouteBadge route={tx.route} />
                  <div className="w-8 h-px bg-surface-700" />
                </div>
              </div>
              <div className="text-center flex-1">
                <div className="text-xs text-gray-400 font-semibold mb-1">{tx.recipientName}</div>
                <div className="text-2xl font-bold text-emerald-600">₹{tx.toAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1 font-mono font-medium">{tx.recipientUpi}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                ['Exchange Rate', `₹${tx.fxRate}`],
                ['Transfer Fee', `₹${tx.transferFee.toLocaleString()}`],
                ['FX Cost', `₹${tx.fxFee.toLocaleString()}`],
                ['Total Cost', `₹${tx.totalFee.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs text-gray-400 font-semibold mb-0.5">{k}</div>
                  <div className="text-gray-100 font-bold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className="card p-5 bg-white border border-surface-700 shadow-card">
            <h2 className="section-title mb-5">Transaction Timeline</h2>
            <div className="space-y-0">
              {timeline.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <TimelineDot status={step.status} />
                    </motion.div>
                    {idx < timeline.length - 1 && (
                      <div className={clsx('w-0.5 flex-1 my-1', step.status === 'done' ? 'bg-emerald-300' : 'bg-surface-700')} style={{ minHeight: 32 }} />
                    )}
                  </div>
                  <div className={clsx('pb-6', idx === timeline.length - 1 && 'pb-0')}>
                    <div className={clsx('text-sm font-bold', step.status === 'done' ? 'text-gray-100' : step.status === 'active' ? 'text-brand-600' : 'text-gray-400')}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Route info */}
          <div className="card p-4 bg-white border border-surface-700 shadow-card">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Settlement Rail</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Rail</span><RouteBadge route={tx.route} /></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Est. time</span><span className="text-gray-100 font-semibold">{tx.route === 'npci' ? '~30 sec' : tx.route === 'blockchain' ? '~15 sec' : tx.route === 'bank' ? '1–2 days' : '1–3 days'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">Settlement time</span><span className="text-gray-100 font-semibold">{tx.settlementTime ? `${tx.settlementTime}s` : '—'}</span></div>
              {tx.route === 'blockchain' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Network</span>
                  <span className="badge-demo">TESTNET</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk */}
          <div className="card p-4 bg-white border border-surface-700 shadow-card">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Risk Assessment</h3>
            <div className={clsx('text-2xl font-bold mono mb-1', tx.riskLevel === 'LOW' ? 'text-emerald-700' : tx.riskLevel === 'MEDIUM' ? 'text-amber-700' : 'text-red-700')}>
              {tx.riskScore} / 100
            </div>
            <RiskBadge level={tx.riskLevel} />
            <div className="text-xs text-gray-400 font-medium mt-2">Purpose: <strong className="text-gray-100">{tx.purpose}</strong></div>
          </div>

          {/* Blockchain */}
          {tx.blockchainTxHash && (
            <div className="card p-4 bg-white border border-surface-700 shadow-card">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">On-Chain Record</h3>
              <div className="text-xs font-mono text-brand-700 font-semibold break-all bg-brand-50 p-2 rounded-lg border border-brand-200">{tx.blockchainTxHash}</div>
              <a href={`https://sepolia.etherscan.io/tx/${tx.blockchainTxHash}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-semibold mt-2">
                View on Etherscan <ExternalLink size={11} />
              </a>
            </div>
          )}
          {!tx.blockchainTxHash && tx.route === 'blockchain' && (
            <div className="card p-4 border-dashed bg-white border-surface-700">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">On-Chain Record</h3>
              <p className="text-xs text-gray-400">Settlement hash will appear here once the blockchain transaction is confirmed.</p>
              <span className="badge-demo mt-2">TESTNET</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate('/send')} className="btn-primary text-sm justify-center">
              <Send size={14} /> Send Another
            </button>
            <button className="btn-secondary text-sm justify-center">
              <Download size={14} /> Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
