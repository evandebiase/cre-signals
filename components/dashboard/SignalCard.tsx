'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { SignalScore, getBand } from '@/components/ui/SignalScore';
import { TrendBadge } from '@/components/ui/TrendBadge';
import type { ZipSignal } from '@/lib/db/queries';
import { clsx } from 'clsx';

type Props = {
  signal: ZipSignal;
};

const SIGNAL_TYPE_ICONS: Record<string, string> = {
  permit_velocity: '🏗️',
  vacancy_shift: '🏢',
  lease_cluster: '📋',
  composite: '📊',
};

export function SignalCard({ signal }: Props) {
  const [expanded, setExpanded] = useState(false);
  const band = getBand(signal.signal_score);

  const borderColor = {
    'bg-gray-500': 'border-gray-500/30',
    'bg-blue-500': 'border-blue-500/30',
    'bg-amber-400': 'border-amber-400/30',
    'bg-orange-500': 'border-orange-500/30',
    'bg-red-500': 'border-red-500/40',
  }[band.color] ?? 'border-navy-700';

  return (
    <div
      className={clsx(
        'bg-navy-800 border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-navy-700/50',
        borderColor,
        expanded && 'ring-1 ring-teal-400/20'
      )}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">
            {SIGNAL_TYPE_ICONS[signal.signal_type] ?? '📊'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono font-bold text-teal-400 text-lg">{signal.zip_code}</span>
              <span className="text-slate-400 text-sm capitalize">{signal.signal_type.replace('_', ' ')}</span>
              {signal.pct_change_30d !== null && (
                <TrendBadge value={signal.pct_change_30d} />
              )}
            </div>
            {signal.ai_interpretation && (
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                {signal.ai_interpretation}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <SignalScore score={signal.signal_score} size="md" showLabel />
          <span className="text-slate-500 text-xs">
            {formatDistanceToNow(new Date(signal.recorded_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-navy-700 space-y-4">
          {signal.ai_score_rationale && (
            <div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Analysis</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{signal.ai_score_rationale}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Sub-scores</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                ['Permit Volume', signal.permit_volume_score],
                ['Permit Value', signal.permit_value_score],
                ['Permit Type', signal.permit_type_score],
                ['Permit Momentum', signal.permit_momentum_score],
                ['Vacancy Level', signal.vacancy_level_score],
                ['Vacancy Direction', signal.vacancy_direction_score],
                ['Vacancy Duration', signal.vacancy_duration_score],
                ['Lease Density', signal.lease_density_score],
                ['Lease Sqft', signal.lease_sqft_score],
                ['Lease Timing', signal.lease_timing_score],
              ].map(([label, val]) => (
                val !== null && (
                  <div key={label as string} className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-300 w-6 text-right">{val}</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {signal.ai_confidence_score !== null && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>AI Confidence:</span>
              <span className="font-mono text-slate-300">{signal.ai_confidence_score}/100</span>
              {signal.data_completeness !== null && (
                <>
                  <span>·</span>
                  <span>Data completeness: {Math.round((signal.data_completeness as number) * 100)}%</span>
                </>
              )}
            </div>
          )}

          <a
            href={`/explorer/${signal.zip_code}`}
            className="inline-flex items-center gap-1.5 text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Explore {signal.zip_code} →
          </a>
        </div>
      )}
    </div>
  );
}
