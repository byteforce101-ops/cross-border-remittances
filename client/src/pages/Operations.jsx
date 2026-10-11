import { useStore } from '../store/useStore.js';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { fxService } from '../services/fxService.js';
import { ATTENTION_ITEMS } from '../services/mockData.js';

const RAIL_STATUS = [
  { name: 'UPI-linked Partner Rail', status: 'Operational', latency: '350ms', success: '99.2%', badge: 'ok' },
  { name: 'IMPS Correspondent Banking', status: 'Operational (Cut-off active)', latency: '1200ms', success: '97.8%', badge: 'warn' },
  { name: 'Blockchain-settled Partner Rail', status: 'Degraded (slow block times)', latency: '4500ms', success: '94.1%', badge: 'warn' },
  { name: 'Direct NPCI Rail', status: 'Not Integrated (Sandbox Mock)', latency: '—', success: '—', badge: 'neutral' },
];

export default function Operations() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);
  const recent = transactions.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Operations</h1>
          <p className="text-mute text-sm mt-0.5">
            Rail connectivity, active exceptions, and routing operations · <span className="demo">DEMO ENVIRONMENT</span>
          </p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/send')}>
          New simulated transfer
        </button>
      </div>

      {/* Operational Attention Queue */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-ink">Active Operations Queue ({ATTENTION_ITEMS.length})</h2>
        <div className="bg-white border border-rule rounded divide-y divide-rule">
          {ATTENTION_ITEMS.map((item) => (
            <div key={item.id} className="p-4 flex flex-wrap items-center gap-3">
              <span className={`chip ${item.badgeType === 'warn' ? 'bg-warnsoft text-warn' : 'bg-infosoft text-info'}`}>
                {item.badgeText}
              </span>
              <span className="font-mono text-sm font-semibold text-ink">{item.reference}</span>
              <span className="flex-1 text-sm text-ink">{item.message}</span>
              <button
                onClick={() => navigate(item.actionLink)}
                className="btn btn-s text-xs py-1 px-3 min-h-[32px]"
              >
                {item.actionText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Rail Health Status */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Payment Rail Connectivity &amp; Latency</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-mute bg-canvas border-b border-rule">
              <tr>
                <th className="p-3 font-medium">Payment Rail</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Simulated Latency</th>
                <th className="p-3 font-medium">14-Day Success</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {RAIL_STATUS.map((rail) => (
                <tr key={rail.name}>
                  <td className="p-3 font-medium text-ink">{rail.name}</td>
                  <td className="p-3">
                    <span
                      className={`chip ${
                        rail.badge === 'ok'
                          ? 'bg-oksoft text-ok'
                          : rail.badge === 'warn'
                          ? 'bg-warnsoft text-warn'
                          : 'bg-canvas text-mute border border-rule'
                      }`}
                    >
                      {rail.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-ink">{rail.latency}</td>
                  <td className="p-3 font-medium text-ink num">{rail.success}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity Log */}
      <section className="bg-white border border-rule rounded p-5 space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">Recent Routing Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-mute bg-canvas border-b border-rule">
              <tr>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Sender</th>
                <th className="p-3 font-medium">Amount Sent</th>
                <th className="p-3 font-medium">Recipient Receives</th>
                <th className="p-3 font-medium">Route</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {recent.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className="hover:bg-canvas/50 transition-colors cursor-pointer"
                >
                  <td className="p-3 font-mono text-xs font-semibold text-ink">{tx.id}</td>
                  <td className="p-3 text-ink">{tx.senderName}</td>
                  <td className="p-3 num font-medium text-ink">{fxService.formatAED(tx.fromAmount)}</td>
                  <td className="p-3 num font-medium text-ink">{fxService.formatINR(tx.toAmount)}</td>
                  <td className="p-3 text-mute">{tx.routeShort || tx.route}</td>
                  <td className="p-3"><StatusBadge status={tx.status} customLabel={tx.statusLabel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

