import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Signal Feed', icon: '📡' },
  { href: '/explorer/10001', label: 'Zip Explorer', icon: '🔍' },
  { href: '/map', label: 'Permit Map', icon: '🗺️' },
  { href: '/leases', label: 'Lease Radar', icon: '📋' },
  { href: '/chat', label: 'AI Analyst', icon: '🤖' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-navy-900 border-r border-navy-800 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-400/20 flex items-center justify-center">
              <span className="text-teal-400 text-sm font-bold">C</span>
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm leading-none">CRE Signals</div>
              <div className="text-slate-600 text-xs mt-0.5">Market Intelligence</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-all text-sm"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-navy-800 flex items-center gap-3">
          <UserButton />
          <div className="min-w-0">
            <div className="text-xs text-slate-400 truncate">Account</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
