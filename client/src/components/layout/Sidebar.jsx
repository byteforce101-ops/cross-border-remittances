import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',             label: 'Overview' },
  { to: '/send',         label: 'Send money' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/recipients',   label: 'Recipients' },
  { to: '/routes',       label: 'Payment routes' },
  { to: '/operations',   label: 'Operations' },
  { to: '/settlement',   label: 'Settlement' },
  { to: '/risk',         label: 'Risk & compliance' },
  { to: '/analytics',    label: 'Analytics' },
  { to: '/settings',     label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:block border-r border-rule p-4 bg-canvas min-h-screen">
      {/* Brand Logo */}
      <div className="font-serif text-2xl font-semibold mb-6 tracking-tight text-ink">
        Remit<span className="text-acc font-bold">Ledger</span>
      </div>

      {/* Navigation */}
      <nav className="nav space-y-1" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-white border border-rule font-semibold text-ink shadow-xs'
                  : 'text-mute hover:text-ink hover:bg-white/60 font-medium'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 pt-4 border-t border-rule">
        <p className="text-[11px] text-mute leading-relaxed">
          Corridor: <strong>UAE → India</strong>
        </p>
        <div className="mt-2">
          <span className="demo">SIMULATED RAILS</span>
        </div>
      </div>
    </aside>
  );
}

