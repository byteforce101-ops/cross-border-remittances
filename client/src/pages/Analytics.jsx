import { ROUTE_DISTRIBUTION, DAILY_TRANSFERS_DATA } from '../services/mockData.js';

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] text-ink font-semibold">Analytics &amp; Intelligence</h1>
          <p className="text-mute text-sm mt-0.5">
            14-day corridor volume, rail distribution, and settlement cost efficiency · <span className="demo">DEMO</span>
          </p>
        </div>
      </div>

      {/* 3 Headline Metrics */}
      <dl className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-dashed border-warn/60 rounded p-4">
          <dt className="text-sm text-mute">14-Day Completed Transfers</dt>
          <dd className="font-serif text-[28px] text-ink font-semibold num my-1">984</dd>
          <dd className="text-sm text-ok">▲ 98.4% corridor success rate</dd>
        </div>
        <div className="bg-white border border-dashed border-warn/60 rounded p-4">
          <dt className="text-sm text-mute">Average Total Remittance Cost</dt>
          <dd className="font-serif text-[28px] text-ink font-semibold num my-1">0.84%</dd>
          <dd className="text-sm text-mute">Transfer fee + FX conversion spread</dd>
        </div>
        <div className="bg-white border border-dashed border-warn/60 rounded p-4">
          <dt className="text-sm text-mute">Fastest Rail Average</dt>
          <dd className="font-serif text-[28px] text-ink font-semibold num my-1">10 min</dd>
          <dd className="text-sm text-ok">UPI-linked partner rail (46% share)</dd>
        </div>
      </dl>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily volume */}
        <section className="bg-white border border-rule rounded p-5 space-y-3">
          <h2 className="font-serif text-lg font-semibold text-ink">14-Day Transfer Volume Trend</h2>
          <p className="text-xs text-mute">Volume band (55 – 80 transfers/day) illustrated in teal.</p>
          <div className="w-full pt-2">
            <svg viewBox="0 0 420 140" className="w-full h-auto" role="img">
              <rect x="0" y="30" width="420" height="50" fill="#E3F0EE" opacity=".6" />
              <line x1="0" y1="30" x2="420" y2="30" stroke="#0E6B62" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="420" y2="80" stroke="#0E6B62" strokeDasharray="4 4" />
              <g fill="#16233B" opacity=".8">
                {DAILY_TRANSFERS_DATA.slice(0, 13).map((val, i) => (
                  <rect key={i} x={6 + i * 30} y={130 - val} width="22" height={val} />
                ))}
              </g>
              <rect x="396" y="59" width="22" height="71" fill="#0E6B62" />
              <text x="396" y="52" fontSize="11" fill="#0E6B62" fontWeight="600">71</text>
              <text x="0" y="12" fontSize="11" fill="#5B6577">Typical range 55–80</text>
              <text x="6" y="138" fontSize="10" fill="#5B6577">26 Sep</text>
              <text x="380" y="138" fontSize="10" fill="#5B6577">Today</text>
            </svg>
          </div>
        </section>

        {/* Rail breakdown */}
        <section className="bg-white border border-rule rounded p-5 space-y-3">
          <h2 className="font-serif text-lg font-semibold text-ink">Corridor Settlement Distribution</h2>
          <p className="text-xs text-mute">Routing share &amp; reliability across active payment rails.</p>
          <div className="space-y-4 pt-2">
            {ROUTE_DISTRIBUTION.map((item) => (
              <div key={item.name} className="space-y-1 text-sm">
                <div className="flex justify-between font-medium">
                  <span className="text-ink">{item.name}</span>
                  <span className="num text-mute">{item.share}% · {item.successRate}% success</span>
                </div>
                <div className="h-2 bg-rule rounded overflow-hidden">
                  <div className={`h-2 ${item.barColor} rounded`} style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

