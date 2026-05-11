'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Signal Feed',  icon: '📡' },
  { href: '/explorer/10001', label: 'Zip Explorer', icon: '🔍' },
  { href: '/map',       label: 'Permit Map',   icon: '🗺️' },
  { href: '/leases',    label: 'Lease Radar',  icon: '📋' },
  { href: '/chat',      label: 'AI Analyst',   icon: '🤖' },
  { href: '/settings',  label: 'Settings',     icon: '⚙️' },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href.split('/')[1] === 'explorer' ? '/explorer' : '___');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all',
              active
                ? 'bg-teal-400/10 text-teal-400 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
            )}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy-900 border-b border-navy-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-400/20 flex items-center justify-center">
            <span className="text-teal-400 text-sm font-bold">C</span>
          </div>
          <span className="font-bold text-slate-100 text-sm">CRE Signals</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={clsx(
        'md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-navy-900 border-r border-navy-800 flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-400/20 flex items-center justify-center">
              <span className="text-teal-400 text-sm font-bold">C</span>
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm leading-none">CRE Signals</div>
              <div className="text-slate-600 text-xs mt-0.5">Market Intelligence</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <NavLinks />
        <div className="px-4 py-4 border-t border-navy-800 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-slate-400">Account</span>
        </div>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-navy-900 border-r border-navy-800 flex-col h-screen sticky top-0">
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
        <NavLinks />
        <div className="px-4 py-4 border-t border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserButton />
            <span className="text-xs text-slate-400">Account</span>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
