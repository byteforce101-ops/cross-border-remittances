import { NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore.js';
import {
  LayoutDashboard, Send, List, Users, GitBranch, ShieldCheck,
  Layers, Settings, BarChart3, Activity, ChevronLeft, ChevronRight,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Overview' },
  { to: '/send',         icon: Send,            label: 'Send Money',  highlight: true },
  { to: '/transactions', icon: List,            label: 'Transactions' },
  { to: '/recipients',   icon: Users,           label: 'Recipients' },
  { to: '/routes',       icon: GitBranch,       label: 'Routes' },
  { to: '/risk',         icon: ShieldCheck,     label: 'Risk & Compliance' },
  { to: '/settlement',   icon: Layers,          label: 'Settlement' },
  { to: '/operations',   icon: Activity,        label: 'Operations' },
  { to: '/analytics',    icon: BarChart3,       label: 'Analytics' },
  { to: '/settings',     icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const collapsed = useStore(s => s.sidebarCollapsed);
  const toggle = useStore(s => s.setSidebarCollapsed);

  return (
    <aside className={clsx(
      'flex flex-col h-screen bg-white border-r border-surface-700 transition-all duration-300 z-30 shadow-sm',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-700">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-glow-brand">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-sm text-gray-100 leading-tight">RemittanceOS</div>
            <div className="text-[10px] text-brand-600 font-mono font-bold tracking-widest uppercase">Orchestration Platform</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {!collapsed && (
          <div className="px-4 mb-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Navigation</span>
          </div>
        )}
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label, highlight }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative text-sm',
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-semibold border border-brand-200/80 shadow-xs'
                    : highlight
                      ? 'text-brand-600 bg-brand-50/40 hover:bg-brand-50 font-medium'
                      : 'text-gray-300 hover:bg-surface-750 hover:text-gray-100 font-medium'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full" />}
                    <Icon
                      size={16}
                      className={clsx(
                        'flex-shrink-0',
                        isActive ? 'text-brand-600' : highlight ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-100'
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">
                        {label}
                      </span>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                        {label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom — collapse toggle */}
      <div className="p-3 border-t border-surface-700">
        <button
          onClick={() => toggle(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-surface-750 rounded-lg transition-all text-sm font-medium"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
