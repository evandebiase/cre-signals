'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/stripe/client';

type WatchlistItem = { id: string; zip_code: string; label: string | null; alert_threshold: number };

export default function SettingsPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded');

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newZip, setNewZip] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/signals/feed')
      .then(r => r.json())
      .then(data => { setWatchlist(data.watchlist ?? []); setLoading(false); });
  }, []);

  async function addZip() {
    if (!newZip.match(/^\d{5}$/)) return;
    setSaving(true);
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip: newZip }),
    });
    setWatchlist(prev => [...prev, { id: Date.now().toString(), zip_code: newZip, label: null, alert_threshold: 65 }]);
    setNewZip('');
    setSaving(false);
  }

  async function removeZip(zip: string) {
    await fetch(`/api/watchlist?zip=${zip}`, { method: 'DELETE' });
    setWatchlist(prev => prev.filter(w => w.zip_code !== zip));
  }

  async function startCheckout(plan: string) {
    setCheckingOut(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Could not start checkout. Please try again.');
    } finally {
      setCheckingOut(null);
    }
  }

  const currentPlan = (user?.publicMetadata?.plan as string) ?? 'starter';
  const planConfig = PLANS[currentPlan as keyof typeof PLANS] ?? PLANS.starter;

  return (
    <div className="px-4 sm:px-8 py-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Settings</h1>

      {upgraded && (
        <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl px-5 py-4 text-teal-400 text-sm font-medium">
          ✓ Plan upgraded successfully. Welcome to {currentPlan}!
        </div>
      )}

      {/* Watchlist */}
      <section className="bg-navy-800 border border-navy-700 rounded-xl p-5 sm:p-6">
        <h2 className="text-slate-200 font-semibold mb-1">Zip Code Watchlist</h2>
        <p className="text-slate-500 text-sm mb-4">
          Tracking {watchlist.length} / {planConfig.limits.maxZips === -1 ? '∞' : planConfig.limits.maxZips} zip codes
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {watchlist.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No zip codes added yet.</p>
            )}
            {watchlist.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-2 bg-navy-900 border border-navy-700 rounded-lg px-3 sm:px-4 py-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="font-mono font-bold text-teal-400 flex-shrink-0">{item.zip_code}</span>
                  {item.label && <span className="text-slate-500 text-sm truncate">{item.label}</span>}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="text-slate-600 text-xs hidden sm:inline">Alert ≥{item.alert_threshold}</span>
                  <a href={`/explorer/${item.zip_code}`} className="text-xs text-slate-400 hover:text-teal-400 transition-colors">
                    Explore →
                  </a>
                  <button onClick={() => removeZip(item.zip_code)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={newZip}
            onChange={e => setNewZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={e => e.key === 'Enter' && addZip()}
            placeholder="Enter 5-digit zip..."
            className="flex-1 min-w-0 bg-navy-900 border border-navy-600 rounded-lg px-4 py-2.5 text-slate-200 text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-teal-400/50 transition-colors"
          />
          <button
            onClick={addZip}
            disabled={saving || !newZip.match(/^\d{5}$/)}
            className="px-4 py-2.5 bg-teal-400 text-navy-900 font-semibold text-sm rounded-lg hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            Add
          </button>
        </div>
      </section>

      {/* Plan */}
      <section className="bg-navy-800 border border-navy-700 rounded-xl p-5 sm:p-6">
        <h2 className="text-slate-200 font-semibold mb-5">Subscription</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = key === currentPlan;
            const isLoading = checkingOut === key;
            const planRank = { starter: 0, pro: 1, team: 2 };
            const isDowngrade = planRank[key as keyof typeof planRank] < planRank[currentPlan as keyof typeof planRank];

            return (
              <div
                key={key}
                className={`border rounded-xl p-4 transition-all ${isCurrent ? 'border-teal-400/50 bg-teal-400/5' : 'border-navy-700 hover:border-navy-600'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200">{plan.name}</span>
                  {isCurrent && <span className="text-xs text-teal-400 font-medium bg-teal-400/10 px-2 py-0.5 rounded-full">Current</span>}
                </div>
                <div className="font-mono text-2xl font-bold text-slate-100 mb-3">
                  ${plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-4">
                  <li className="flex items-center gap-1.5">
                    <span className="text-teal-400">✓</span>
                    {plan.limits.maxZips === -1 ? 'Unlimited' : plan.limits.maxZips} zip codes
                  </li>
                  <li className={`flex items-center gap-1.5 ${plan.limits.csvExport ? '' : 'opacity-35'}`}>
                    <span>{plan.limits.csvExport ? '✓' : '✕'}</span> CSV export
                  </li>
                  <li className={`flex items-center gap-1.5 ${plan.limits.alerts ? '' : 'opacity-35'}`}>
                    <span>{plan.limits.alerts ? '✓' : '✕'}</span> Email alerts
                  </li>
                  <li className={`flex items-center gap-1.5 ${plan.limits.apiAccess ? '' : 'opacity-35'}`}>
                    <span>{plan.limits.apiAccess ? '✓' : '✕'}</span> API access
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-teal-400">✓</span>
                    {plan.limits.seats} seat{plan.limits.seats > 1 ? 's' : ''}
                  </li>
                </ul>
                {!isCurrent && !isDowngrade && (
                  <button
                    onClick={() => startCheckout(key)}
                    disabled={isLoading}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-teal-400 text-navy-900 hover:bg-teal-500 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Loading...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
                {isCurrent && (
                  <div className="w-full py-2 text-xs font-semibold rounded-lg bg-navy-700 text-slate-400 text-center">
                    Current plan
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-slate-600 text-xs mt-4 text-center">
          7-day free trial · Cancel anytime · Billed monthly via Stripe
        </p>
      </section>
    </div>
  );
}
