import { routeService } from '../services/routeService.js';
import { useNavigate } from 'react-router-dom';
import { fxService } from '../services/fxService.js';

export default function Routes() {
  const navigate = useNavigate();
  const routes = routeService.analyzeRoutes(5000, 'AED');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Payment Route Intelligence</h1>
          <p className="text-mute text-sm mt-0.5">
            Real-time evaluation across available settlement rails · Corridor: UAE → India · <span className="demo">DEMO</span>
          </p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/send')}>
          Send money with optimal route
        </button>
      </div>

      {/* Orchestration Philosophy Callout */}
      <div className="bg-accsoft border border-acc rounded p-5 space-y-2">
        <h2 className="font-semibold text-ink text-base">Orchestration &amp; Rail Selection Engine</h2>
        <p className="text-sm text-ink leading-relaxed">
          RemitLedger dynamically evaluates fee structures, mid-market FX spread, speed benchmarks, network reliability, and recipient account compatibility. Routes are compared transparently based on total cost and arrival certainty.
        </p>
      </div>

      {/* Rail Cards Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {routes.map((route) => {
          const isRec = route.badge === 'RECOMMENDED';
          const isLowest = route.badge === 'LOWEST_COST';
          const isDegraded = route.badge === 'DEGRADED';
          const isUnavailable = !route.isAvailable;

          return (
            <div
              key={route.id}
              className={`bg-white border rounded p-5 space-y-4 ${
                isUnavailable ? 'bg-[#F1EEE7] border-rule opacity-85' : 'border-rule'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {isRec && <span className="chip bg-acc text-white">★ Recommended</span>}
                    {isLowest && <span className="chip bg-canvas text-ink border border-rule">Lowest cost</span>}
                    {isDegraded && <span className="chip bg-warnsoft text-warn">▲ Degraded</span>}
                    {isUnavailable && <span className="chip bg-canvas text-mute border border-rule">✕ Not available</span>}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-ink">{route.name}</h3>
                  <p className="text-xs text-mute mt-0.5">{route.subtext}</p>
                </div>
              </div>

              {route.isAvailable ? (
                <>
                  <div className="grid grid-cols-3 gap-2 bg-canvas/60 p-3 rounded border border-rule/50 text-center">
                    <div>
                      <span className="text-[11px] text-mute uppercase tracking-wider block">Base Fee</span>
                      <span className="font-medium text-ink text-sm num">{fxService.formatAED(route.calc.feeAED)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-mute uppercase tracking-wider block">Speed</span>
                      <span className="font-medium text-ink text-sm">{route.eta}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-mute uppercase tracking-wider block">Reliability</span>
                      <span className="font-medium text-ok text-sm num">{route.reliability}%</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-ink uppercase tracking-wider text-[10px]">Key Characteristics</p>
                    <ul className="space-y-1 text-mute">
                      {route.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-ink">
                          <span className="text-acc font-bold">✓</span> {p}
                        </li>
                      ))}
                      {route.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-mute">
                          <span className="text-warn font-bold">▲</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="py-6 text-sm text-mute leading-relaxed">
                  <p>{route.unavailableReason}</p>
                  <p className="mt-2 text-xs">
                    Integration will be enabled upon bilateral regulatory approval and technical sandbox verification.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <section className="bg-white border border-rule rounded p-5 space-y-3" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" className="font-serif text-lg font-semibold text-ink">
          Route comparison matrix (for AED 5,000 transfer)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-mute bg-canvas border-b border-rule">
              <tr>
                <th className="p-3 font-medium">Route</th>
                <th className="p-3 font-medium">Total Cost</th>
                <th className="p-3 font-medium">Recipient Gets</th>
                <th className="p-3 font-medium">Arrival Time</th>
                <th className="p-3 font-medium">Reliability</th>
                <th className="p-3 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {routes.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium text-ink">{r.name}</td>
                  <td className="p-3 num font-medium text-ink">
                    {r.isAvailable ? r.totalCostFormatted : '—'}
                  </td>
                  <td className="p-3 num font-medium text-ink">
                    {r.isAvailable ? r.recipientINRFormatted : '—'}
                  </td>
                  <td className="p-3 text-ink">{r.eta}</td>
                  <td className="p-3 num text-ink">{r.reliability}%</td>
                  <td className="p-3">
                    {r.isAvailable ? (
                      <span className="chip bg-oksoft text-ok text-[11px]">Available</span>
                    ) : (
                      <span className="chip bg-canvas text-mute border border-rule text-[11px]">Unavailable</span>
                    )}
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

