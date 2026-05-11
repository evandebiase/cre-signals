'use client';

import { SignalScore, getBand } from '@/components/ui/SignalScore';
import { TrendBadge } from '@/components/ui/TrendBadge';
import { TrendSparkline } from './TrendSparkline';
import type { ZipSignal } from '@/lib/db/queries';

type Props = {
  zip: string;
  signals: ZipSignal[];
};

export function ZipOverview({ zip, signals }: Props) {
  const latest = signals[signals.length - 1];
  if (!latest) return null;

  const band = getBand(latest.signal_score);

  const sparkData = signals.map(s => ({
    date: s.recorded_at,
    value: s.signal_score,
  }));

  const subScores = [
    { label: 'Permit Volume', value: latest.permit_volume_score, color: '#3B82F6' },
    { label: 'Vacancy Level', value: latest.vacancy_level_score, color: '#00D4AA' },
    { label: 'Lease Density', value: latest.lease_density_score, color: '#F59E0B' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Main score */}
      <div className="md:col-span-1 bg-navy-800 border border-navy-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
        <div className="text-slate-400 text-sm uppercase tracking-wider">{zip} Signal Score</div>
        <div className="flex items-end gap-3">
          <span className="font-mono text-6xl font-bold text-slate-100">{latest.signal_score}</span>
          <div className="mb-2">
            <SignalScore score={latest.signal_score} size="lg" />
          </div>
        </div>
        <span className={`font-semibold text-lg`}>{band.label}</span>
        <TrendBadge value={latest.pct_change_30d} suffix="% 30d" />
      </div>

      {/* Sparkline */}
      <div className="md:col-span-2 bg-navy-800 border border-navy-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-300 font-medium">12-Month Signal Trend</h3>
          <span className="text-slate-500 text-xs">Updated {new Date(latest.recorded_at).toLocaleDateString()}</span>
        </div>
        <TrendSparkline data={sparkData} height={80} />
      </div>

      {/* Sub-scores */}
      {subScores.map(s => (
        <div key={s.label} className="bg-navy-800 border border-navy-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{s.label}</span>
            <span className="font-mono font-bold text-xl" style={{ color: s.color }}>
              {s.value ?? '—'}
            </span>
          </div>
          {s.value !== null && s.value !== undefined && (
            <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${s.value}%`, backgroundColor: s.color }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
