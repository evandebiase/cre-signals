'use client';

import { useEffect, useState } from 'react';
import { SignalCard } from './SignalCard';
import type { ZipSignal } from '@/lib/db/queries';

export function SignalFeed() {
  const [signals, setSignals] = useState<ZipSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/signals/feed')
      .then(r => r.json())
      .then(data => {
        setSignals(data.signals ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-navy-800 border border-navy-700 rounded-xl p-5">
            <div className="flex justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
              <div className="skeleton h-16 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📡</div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No signals yet</h3>
        <p className="text-slate-500 max-w-sm">
          Add zip codes to your watchlist to start receiving market intelligence signals.
        </p>
        <a
          href="/settings"
          className="mt-6 px-5 py-2.5 bg-teal-400 text-navy-900 font-semibold rounded-lg hover:bg-teal-500 transition-colors"
        >
          Add zip codes
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {signals.map((signal, i) => (
        <SignalCard key={signal.id} signal={signal} defaultExpanded={i === 0} />
      ))}
    </div>
  );
}
