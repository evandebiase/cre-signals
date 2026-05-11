'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { PLANS } from '@/lib/stripe/client';

type WatchlistItem = { id: string; zip_code: string; label: string | null; alert_threshold: number };

export default function SettingsPage() {
  const { user } = useUser();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newZip, setNewZip] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/signals/feed')
      .then(r => r.json())
      .then(data => {
        setWatchlist(data.watchlist ?? []);
        setLoading(false);
      });
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

  const currentPlan = (user?.publicMetadata?.plan as string) ?? 'starter';
  const planConfig = PLANS[currentPlan as keyof typeof PLANS] ?? PLANS.starter;

  return (
    <div className="px-8 py-8 max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      {/* Watchlist */}
      <section className="bg-navy-800 border border-navy-700 rounded-xl p-6">
        <h2 className="text-slate-200 font-semibold mb-1">Zip Code Watchlist</h2>
        <p className="text-slate-500 text-sm mb-5">
          Tracking {watchlist.length} / {planConfig.limits.maxZips === -1 ? '∞' : planConfig.limits.maxZips} zip codes
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {watchlist.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 bg-navy-900 border border-navy-700 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-teal-400">{item.zip_code}</span>
                  {item.label && <span className="text-slate-500 text-sm">{item.label}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-xs">Alert at ≥{item.alert_threshold}</span>
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
            className="flex-1 bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-slate-200 text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-teal-400/50 transition-colors"
          />
          <button
            onClick={addZip}
            disabled={saving || !newZip.match(/^\d{5}$/)}
            className="px-4 py-2 bg-teal-400 text-navy-900 font-semibold text-sm rounded-lg hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      {/* Plan */}
      <section className="bg-navy-800 border border-navy-700 rounded-xl p-6">
        <h2 className="text-slate-200 font-semibold mb-5">Subscription</h2>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = key === currentPlan;
            return (
              <div
                key={key}
                className={`border rounded-xl p-4 ${isCurrent ? 'border-teal-400/50 bg-teal-400/5' : 'border-navy-700'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200">{plan.name}</span>
                  {isCurrent && <span className="text-xs text-teal-400 font-medium">Current</span>}
                </div>
                <div className="font-mono text-2xl font-bold text-slate-100 mb-3">
                  ${plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-4">
                  <li>{plan.limits.maxZips === -1 ? 'Unlimited' : plan.limits.maxZips} zip codes</li>
                  <li className={plan.limits.csvExport ? 'text-slate-300' : 'line-through opacity-40'}>CSV export</li>
                  <li className={plan.limits.alerts ? 'text-slate-300' : 'line-through opacity-40'}>Alerts</li>
                  <li className={plan.limits.apiAccess ? 'text-slate-300' : 'line-through opacity-40'}>API access</li>
                  <li>{plan.limits.seats} seat{plan.limits.seats > 1 ? 's' : ''}</li>
                </ul>
                {!isCurrent && (
                  <button className="w-full py-1.5 text-xs font-semibold rounded-lg bg-teal-400/10 text-teal-400 hover:bg-teal-400/20 transition-colors border border-teal-400/20">
                    Upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
