import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { fxService } from '../services/fxService.js';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';
import { Copy, ArrowLeft, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TransactionDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const getTransaction = useStore(s => s.getTransaction);
  const updateTransaction = useStore(s => s.updateTransaction);
  const fetchTransactions = useStore(s => s.fetchTransactions);
  const [copied, setCopied] = useState(false);

  const tx = getTransaction(id);

  useEffect(() => {
    if (!tx) {
      fetchTransactions();
    }
  }, [tx, fetchTransactions]);

  if (!tx) {
    return (
      <div className="bg-white border border-rule rounded p-8 text-center max-w-lg mx-auto mt-8">
        <h2 className="font-serif text-xl font-semibold text-ink mb-2">Transaction Not Found</h2>
        <p className="text-sm text-mute mb-4">No record found with identifier {id}.</p>
        <button className="btn btn-s" onClick={() => navigate('/transactions')}>
          Back to transactions
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = tx.status === TRANSACTION_STATUS.COMPLETED;
  const isReview = tx.status === TRANSACTION_STATUS.COMPLIANCE_REVIEW || tx.id === 'TXN-D-0041';
  const isDelayed = tx.status === TRANSACTION_STATUS.SETTLEMENT_PENDING || tx.id === 'TXN-D-0038';
  const isFailed = tx.status === TRANSACTION_STATUS.FAILED || tx.id === 'TXN-D-0039';
  const isProcessing = tx.status === TRANSACTION_STATUS.PROCESSING || tx.id === 'TXN-D-0040';

  const handleResolveReview = () => {
    updateTransaction(tx.id, {
      status: TRANSACTION_STATUS.PROCESSING,
      statusLabel: 'Processing',
      note: 'Sender verified recipient name match. Proceeding with settlement.',
    });
  };

  const handleRetryFailed = () => {
    navigate('/send');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/transactions')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mute hover:text-ink transition-colors"
        >
          <ArrowLeft size={15} /> Back to transactions
        </button>
      </div>

      {/* Edge Case Banners */}
      {isReview && (
        <div className="bg-infosoft border border-info rounded p-4 text-sm text-info flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <strong>◆ Additional Verification Required:</strong> {tx.note || 'Recipient name did not fully match the account holder.'}
          </div>
          <button onClick={handleResolveReview} className="btn btn-p text-xs py-1.5 px-3 min-h-[36px] shrink-0">
            Confirm Account Match
          </button>
        </div>
      )}

      {isDelayed && (
        <div className="bg-warnsoft border border-warn rounded p-4 text-sm text-warn">
          <strong>▲ Delayed Settlement Alert:</strong> {tx.note || 'Settlement running past the estimate on the IMPS route.'}
        </div>
      )}

      {isFailed && (
        <div className="bg-badsoft border border-bad rounded p-4 text-sm text-bad flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <strong>✕ Transfer Failed:</strong> {tx.note || 'Refund of principal amount has been simulated.'}
          </div>
          <button onClick={handleRetryFailed} className="btn btn-bad text-xs py-1.5 px-3 min-h-[36px] shrink-0">
            Retry Transfer
          </button>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white border border-rule rounded p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-rule pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-lg text-ink">{tx.id}</span>
            <button
              onClick={handleCopy}
              className="p-1 text-mute hover:text-ink transition-colors rounded"
              title="Copy Reference"
            >
              {copied ? <Check size={15} className="text-ok" /> : <Copy size={15} />}
            </button>
          </div>
          <StatusBadge status={tx.status} customLabel={tx.statusLabel} />
        </div>

        {/* Amount hero */}
        <div>
          <p className="text-xs text-mute uppercase font-semibold tracking-wider">Recipient receives</p>
          <p className="font-serif text-[40px] num font-semibold text-ink leading-tight my-1">
            {fxService.formatINR(tx.toAmount)}
          </p>
          <p className="text-sm text-mute">
            From {fxService.formatAED(tx.fromAmount)} · {tx.routeName || tx.route} · Corridor: UAE → India
          </p>
        </div>

        {/* Two column details */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <dl className="divide-y divide-rule">
            <div className="row">
              <dt>Sender</dt>
              <dd>{tx.senderName} (UAE)</dd>
            </div>
            <div className="row">
              <dt>Recipient</dt>
              <dd>{tx.recipientName}</dd>
            </div>
            <div className="row">
              <dt>UPI ID / Account</dt>
              <dd className="font-mono text-xs">{tx.recipientUpi}</dd>
            </div>
            <div className="row">
              <dt>Purpose</dt>
              <dd>{tx.purpose}</dd>
            </div>
          </dl>
          <dl className="divide-y divide-rule">
            <div className="row">
              <dt>Applied FX Rate</dt>
              <dd>1 AED = ₹{tx.fxRate?.toFixed(2) || '23.98'}</dd>
            </div>
            <div className="row">
              <dt>Transfer Fee</dt>
              <dd>{fxService.formatAED(tx.transferFee || 12.00)}</dd>
            </div>
            <div className="row">
              <dt>FX Conversion Cost</dt>
              <dd>{fxService.formatAED(tx.fxFee || 28.95)}</dd>
            </div>
            <div className="row font-semibold">
              <dt className="!text-ink">Total Cost</dt>
              <dd>{fxService.formatAED(tx.totalFee || 40.95)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Event Timeline */}
      <section className="bg-white border border-rule rounded p-4 sm:p-6" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="font-serif text-lg font-semibold text-ink mb-4">
          Event timeline
        </h2>
        <ol className="space-y-4 text-sm">
          <li className="flex gap-3 items-start">
            <span className="chip bg-oksoft text-ok shrink-0">✓ Done</span>
            <div>
              <p className="font-medium text-ink">Transfer initiated &amp; locked</p>
              <p className="text-mute">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · quote and route verified</p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className={`chip ${isReview ? 'bg-infosoft text-info' : 'bg-oksoft text-ok'} shrink-0`}>
              {isReview ? '◆ Review' : '✓ Done'}
            </span>
            <div>
              <p className="font-medium text-ink">Compliance &amp; identity check</p>
              <p className="text-mute">
                {isReview
                  ? 'Name matching check flagged slight variance against beneficiary bank records'
                  : 'Automated sanction and corridor compliance checks passed'}
              </p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className={`chip ${isDelayed ? 'bg-warnsoft text-warn' : isCompleted ? 'bg-oksoft text-ok' : isFailed ? 'bg-badsoft text-bad' : 'bg-warnsoft text-warn'} shrink-0`}>
              {isCompleted ? '✓ Done' : isDelayed ? '▲ Delayed' : isFailed ? '✕ Failed' : '◔ Now'}
            </span>
            <div>
              <p className="font-medium text-ink">
                {isCompleted ? 'Settlement confirmed' : isDelayed ? 'Settlement processing delayed' : isFailed ? 'Rail failure recorded' : 'Routing to payment rail'}
              </p>
              <p className="text-mute">
                {isCompleted
                  ? 'Funds credited directly to beneficiary account'
                  : isDelayed
                  ? 'Correspondent bank clearing is currently delayed due to cut-off window'
                  : isFailed
                  ? 'PSP response timed out; simulated refund processed'
                  : 'In flight on the partner network'}
              </p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className={`chip ${isCompleted ? 'bg-oksoft text-ok' : 'bg-canvas text-mute border border-rule'} shrink-0`}>
              {isCompleted ? '✓ Done' : '○ Next'}
            </span>
            <div>
              <p className={`font-medium ${isCompleted ? 'text-ink' : 'text-mute'}`}>
                {isCompleted ? 'Transfer completed' : 'Final beneficiary delivery'}
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Technical details accordion */}
      <details className="bg-white border border-rule rounded p-4 sm:p-6 text-sm">
        <summary className="font-medium text-ink cursor-pointer select-none">Technical details</summary>
        <dl className="mt-3 divide-y divide-rule">
          <div className="row">
            <dt>Settlement reference</dt>
            <dd className="font-mono text-xs">{tx.id}-SETTLE-SIM</dd>
          </div>
          <div className="row">
            <dt>On-chain record</dt>
            <dd className="font-mono text-xs break-all">
              {tx.blockchainTxHash ? (
                <span className="text-acc flex items-center justify-end gap-1">
                  {tx.blockchainTxHash} <ExternalLink size={12} />
                </span>
              ) : (
                'None for this route'
              )}
            </dd>
          </div>
          <div className="row">
            <dt>Data source</dt>
            <dd><span className="demo">DEMO SIMULATION</span></dd>
          </div>
        </dl>
      </details>
    </div>
  );
}

