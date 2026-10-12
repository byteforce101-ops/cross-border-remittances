import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { ATTENTION_ITEMS, HEADLINE_METRICS, ROUTE_DISTRIBUTION } from '../services/mockData.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { fxService } from '../services/fxService.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const transactions = useStore(s => s.transactions);
  const fetchTransactions = useStore(s => s.fetchTransactions);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Overview</h1>
          <p className="text-mute text-sm mt-0.5">
            Corridor: UAE → India · Last 14 days · <span className="demo">DEMO DATA</span>
          </p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/send')}>
          Send money
        </button>
      </div>

      {/* 1. Needs attention */}
      <section aria-labelledby="needs-attention-heading">
        <h2 id="needs-attention-heading" className="text-base font-semibold text-ink mb-2">
          Needs attention <span className="text-mute font-normal">· {ATTENTION_ITEMS.length} items</span>
        </h2>
        <ul className="bg-white border border-rule rounded divide-y divide-rule">
          {ATTENTION_ITEMS.map((item) => (
            <li key={item.id} className="p-4 flex flex-wrap items-center gap-3">
              <span className={`chip ${item.badgeType === 'warn' ? 'bg-warnsoft text-warn' : 'bg-infosoft text-info'}`}>
                {item.badgeText}
              </span>
              <span className="font-mono text-sm font-medium text-ink">{item.reference}</span>
              <span className="flex-1 min-w-[200px] text-sm text-ink">{item.message}</span>
              <button
                onClick={() => navigate(item.actionLink)}
                className="text-acc font-medium text-sm underline hover:text-[#0A544D]"
              >
                {item.actionText}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Headline metrics */}
      <section aria-labelledby="headline-metrics-heading">
        <h2 id="headline-metrics-heading" className="text-base font-semibold text-ink mb-2">
          Are transfers progressing normally?
        </h2>
        <dl className="grid sm:grid-cols-3 gap-4">
          {HEADLINE_METRICS.map((metric, idx) => (
            <div key={idx} className="bg-white border border-dashed border-warn/60 rounded p-4">
              <dt className="text-sm text-mute">{metric.label}</dt>
              <dd className="font-serif text-[28px] text-ink font-semibold num my-1">{metric.value}</dd>
              <dd className={`text-sm ${metric.deltaClass}`}>{metric.delta}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 3. Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily transfers trend */}
        <section className="bg-white border border-rule rounded p-4" aria-labelledby="vt">
          <h2 id="vt" className="text-base font-semibold text-ink">Daily transfers</h2>
          <p className="text-sm text-mute mb-3">
            Today is within the normal range (dashed band). <span className="demo">DEMO</span>
          </p>
          <div className="w-full">
            <svg
              viewBox="0 0 420 140"
              className="w-full h-auto"
              role="img"
              aria-label="Daily transfers for 14 days: 62, 70, 66, 74, 71, 58, 55, 69, 73, 77, 72, 68, 75, 71. Today 71."
            >
              {/* Normal range band 55-80 */}
              <rect x="0" y="30" width="420" height="50" fill="#E3F0EE" opacity=".6" />
              <line x1="0" y1="30" x2="420" y2="30" stroke="#0E6B62" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="420" y2="80" stroke="#0E6B62" strokeDasharray="4 4" />
              
              <g fill="#16233B" opacity=".8">
                <rect x="6" y="63" width="22" height="67" />
                <rect x="36" y="54" width="22" height="76" />
                <rect x="66" y="59" width="22" height="71" />
                <rect x="96" y="50" width="22" height="80" />
                <rect x="126" y="53" width="22" height="77" />
                <rect x="156" y="67" width="22" height="63" />
                <rect x="186" y="71" width="22" height="59" />
                <rect x="216" y="55" width="22" height="75" />
                <rect x="246" y="51" width="22" height="79" />
                <rect x="276" y="46" width="22" height="84" />
                <rect x="306" y="52" width="22" height="78" />
                <rect x="336" y="57" width="22" height="73" />
                <rect x="366" y="49" width="22" height="81" />
              </g>
              
              {/* Today's bar */}
              <rect x="396" y="53" width="22" height="77" fill="#0E6B62" />
              <text x="396" y="46" fontSize="11" fill="#0E6B62" fontWeight="600">71</text>
              <text x="0" y="12" fontSize="11" fill="#5B6577">Typical range 55–80</text>
              <text x="6" y="138" fontSize="10" fill="#5B6577">26 Sep</text>
              <text x="380" y="138" fontSize="10" fill="#5B6577">Today</text>
            </svg>
          </div>
        </section>

        {/* Route distribution */}
        <section className="bg-white border border-rule rounded p-4" aria-labelledby="rd">
          <h2 id="rd" className="text-base font-semibold text-ink">Where transfers are routed</h2>
          <p className="text-sm text-mute mb-3">
            Share of transfers and success by route. <span className="demo">DEMO</span>
          </p>
          <ul className="space-y-4 text-sm mt-4">
            {ROUTE_DISTRIBUTION.map((item) => (
              <li key={item.name}>
                <div className="flex justify-between font-medium">
                  <span className="text-ink">{item.name}</span>
                  <span className="num text-mute">{item.share}% · {item.successRate}% success</span>
                </div>
                <div className="h-2 bg-rule rounded mt-1.5 overflow-hidden">
                  <div
                    className={`h-2 ${item.barColor} rounded transition-all duration-500`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. Recent transactions */}
      <section aria-labelledby="recent-tx-heading">
        <div className="flex items-center justify-between mb-2">
          <h2 id="recent-tx-heading" className="text-base font-semibold text-ink">
            Recent transactions <span className="demo ml-1">DEMO</span>
          </h2>
          <button
            onClick={() => navigate('/transactions')}
            className="text-acc text-sm font-medium hover:underline"
          >
            View all transactions →
          </button>
        </div>
        <div className="bg-white border border-rule rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden sm:table-header-group text-left text-mute bg-canvas border-b border-rule">
              <tr>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Sent</th>
                <th className="p-3 font-medium">Recipient gets</th>
                <th className="p-3 font-medium">Route</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {recent.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className="block sm:table-row p-3 sm:p-0 hover:bg-canvas/50 transition-colors cursor-pointer"
                >
                  <td className="sm:p-3 font-mono font-medium block sm:table-cell text-ink">
                    {tx.id}
                  </td>
                  <td className="sm:p-3 num font-medium block sm:table-cell text-ink">
                    {fxService.formatAED(tx.fromAmount)}
                  </td>
                  <td className="sm:p-3 num font-medium block sm:table-cell text-ink">
                    {fxService.formatINR(tx.toAmount)}
                  </td>
                  <td className="sm:p-3 block sm:table-cell text-mute">
                    {tx.routeShort || (tx.route === 'upi_partner' ? 'UPI-linked' : tx.route === 'imps_bank' ? 'IMPS' : 'Blockchain-settled')}
                  </td>
                  <td className="sm:p-3 block sm:table-cell">
                    <StatusBadge status={tx.status} customLabel={tx.statusLabel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

