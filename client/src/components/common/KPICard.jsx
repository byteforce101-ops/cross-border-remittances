import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

export function KPICard({ label, value, subvalue, delta, deltaPositive, icon: Icon, iconColor, highlight }) {
  return (
    <div className={clsx('kpi-card', highlight && 'border-brand-500/30 bg-brand-600/10')}>
      <div className="flex items-start justify-between">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', iconColor || 'bg-brand-500/15')}>
            <Icon size={16} className={highlight ? 'text-brand-400' : 'text-gray-400'} />
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {(subvalue || delta) && (
        <div className="flex items-center gap-2 mt-1">
          {delta && (
            <span className={clsx('flex items-center gap-0.5 text-xs font-medium', deltaPositive ? 'text-emerald-400' : 'text-red-400')}>
              {deltaPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {delta}
            </span>
          )}
          {subvalue && <span className="text-xs text-gray-500">{subvalue}</span>}
        </div>
      )}
    </div>
  );
}
