import { useStore } from '../store/useStore.js';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { fxService } from '../services/fxService.js';
import { TRANSACTION_STATUS } from '@shared/constants/transactionStatus.js';

export default function Settlement() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);

  const pending = transactions.filter(
    t => t.status === TRANSACTION_STATUS.PROCESSING || t.status === TRANSACTION_STATUS.SETTLEMENT_PENDING || t.status === TRANSACTION_STATUS.COMPLIANCE_REVIEW
  );
  const completed = transactions.filter(t => t.status === TRANSACTION_STATUS.COMPLETED);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Settlement Monitor</h1>
          <p className="text-mute text-sm mt-0.5">
            Real-time track of in-flight settlements and correspondent bank clearing.
          </p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/send')}>
          Initiate transfer
        </button>
      </div>

      {/* Metrics */}
      <dl className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-rule rounded p-4">
          <dt className="text-sm text-mute">In-Flight Settlements</dt>
          <dd className="font-serif text-[28px] text-ink font-semibold num my-1">{pending.length}</dd>
          <dd className="text-sm text-mute">Currently routing across partner rails</dd>
        </div>
        <div className="bg-white border border-rule rounded p-4">
          <dt className="text-sm text-mute">Settled (Simulated)</dt>
          <dd className="font-serif text-[28px] text-ok font-semibold num my-1">{completed.length}</dd>
          <dd className="text-sm text-ok">Beneficiary accounts credited</dd>
        </div>
        <div className="bg-white border border-rule rounded p-4">
          <dt className="text-sm text-mute">Average Settlement Time</dt>
          <dd className="font-serif text-[28px] text-ink font-semibold num my-1">14 min</dd>
          <dd className="text-sm text-warn">▲ 3 min slower due to degraded rail</dd>
        </div>
      </dl>

      {/* In-Flight Transfers */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">In-Flight Settlements</h2>
          <span className="demo">SIMULATED QUEUE</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-mute bg-canvas border-b border-rule">
              <tr>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Recipient</th>
                <th className="p-3 font-medium">Amount to Deliver</th>
                <th className="p-3 font-medium">Selected Rail</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-mute">
                    No transfers currently in settlement flight.
                  </td>
                </tr>
              ) : (
                pending.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    className="hover:bg-canvas/50 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono text-xs font-semibold text-ink">{tx.id}</td>
                    <td className="p-3 text-ink">
                      <div>{tx.recipientName}</div>
                      <div className="text-xs font-mono text-mute">{tx.recipientUpi}</div>
                    </td>
                    <td className="p-3 num font-medium text-ink">{fxService.formatINR(tx.toAmount)}</td>
                    <td className="p-3 text-mute">{tx.routeShort || tx.route}</td>
                    <td className="p-3"><StatusBadge status={tx.status} customLabel={tx.statusLabel} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Settlement Rail Breakdown */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Settlement Window Benchmarks by Rail</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-canvas p-3 rounded border border-rule">
            <p className="font-semibold text-ink">UPI Partner Rail</p>
            <p className="text-2xl font-serif text-ink num mt-1">~10 min</p>
            <p className="text-xs text-ok mt-1">99.2% reliability · Instant switch</p>
          </div>
          <div className="bg-canvas p-3 rounded border border-rule">
            <p className="font-semibold text-ink">IMPS Correspondent</p>
            <p className="text-2xl font-serif text-ink num mt-1">30m – 2h</p>
            <p className="text-xs text-warn mt-1">97.8% reliability · Cut-off hours apply</p>
          </div>
          <div className="bg-canvas p-3 rounded border border-rule">
            <p className="font-semibold text-ink">Blockchain Partner</p>
            <p className="text-2xl font-serif text-ink num mt-1">5 – 25 min</p>
            <p className="text-xs text-warn mt-1">▲ Degraded confirmations</p>
          </div>
          <div className="bg-canvas p-3 rounded border border-rule">
            <p className="font-semibold text-ink">Direct NPCI Rail</p>
            <p className="text-2xl font-serif text-mute num mt-1">—</p>
            <p className="text-xs text-mute mt-1">Not connected in demo</p>
          </div>
        </div>
      </section>
    </div>
  );
}

