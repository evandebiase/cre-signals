'use client';

import type { LeaseExpiration } from '@/lib/db/queries';
import { clsx } from 'clsx';

type Props = { leases: LeaseExpiration[] };

function getQuarterSort(q: string): number {
  const [quarter, year] = q.split(' ');
  const qNum = parseInt(quarter.replace('Q', ''));
  return parseInt(year) * 4 + qNum;
}

function getUrgencyColor(q: string): string {
  const now = new Date();
  const [qLabel, year] = q.split(' ');
  const qNum = parseInt(qLabel.replace('Q', ''));
  const expDate = new Date(parseInt(year), (qNum - 1) * 3, 1);
  const daysAway = (expDate.getTime() - now.getTime()) / 86400000;

  if (daysAway < 180) return 'border-red-500/50 bg-red-500/10';
  if (daysAway < 365) return 'border-orange-500/50 bg-orange-500/10';
  return 'border-blue-500/30 bg-blue-500/5';
}

export function LeaseCalendar({ leases }: Props) {
  const grouped = leases.reduce<Record<string, LeaseExpiration[]>>((acc, l) => {
    const q = l.expiration_quarter ?? 'Unknown';
    if (!acc[q]) acc[q] = [];
    acc[q].push(l);
    return acc;
  }, {});

  const sortedQuarters = Object.keys(grouped).sort((a, b) =>
    a === 'Unknown' ? 1 : b === 'Unknown' ? -1 : getQuarterSort(a) - getQuarterSort(b)
  );

  if (leases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-slate-400">No lease expirations found in the database yet.</p>
        <p className="text-slate-600 text-sm mt-2">Run the EDGAR parser to populate lease data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedQuarters.map(quarter => {
        const quarterLeases = grouped[quarter];
        const totalSqft = quarterLeases.reduce((s, l) => s + (l.sq_footage ?? 0), 0);
        const urgencyClass = quarter !== 'Unknown' ? getUrgencyColor(quarter) : 'border-navy-700 bg-navy-800/50';

        return (
          <div key={quarter} className={clsx('border rounded-xl p-5', urgencyClass)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-mono font-bold text-lg text-slate-100">{quarter}</h3>
                <span className="text-slate-500 text-sm">
                  {quarterLeases.length} lease{quarterLeases.length !== 1 ? 's' : ''}
                </span>
              </div>
              {totalSqft > 0 && (
                <span className="font-mono text-sm text-slate-300">
                  {(totalSqft / 1000).toFixed(0)}K sqft total
                </span>
              )}
            </div>

            <div className="space-y-2">
              {quarterLeases.map(l => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-4 py-2.5 px-3 bg-navy-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {l.ticker && (
                      <span className="font-mono text-xs text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded flex-shrink-0">
                        {l.ticker}
                      </span>
                    )}
                    <span className="text-slate-300 text-sm truncate">{l.company_name ?? 'Unknown'}</span>
                    {l.zip_code && (
                      <span className="text-slate-500 text-xs flex-shrink-0">
                        <a href={`/explorer/${l.zip_code}`} className="hover:text-teal-400 transition-colors">
                          {l.zip_code}
                        </a>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {l.sq_footage && (
                      <span className="font-mono text-xs text-slate-400">
                        {l.sq_footage.toLocaleString()} sqft
                      </span>
                    )}
                    {l.ai_confidence && (
                      <span className={clsx(
                        'text-xs font-mono px-1.5 py-0.5 rounded',
                        l.ai_confidence >= 0.8 ? 'text-teal-400 bg-teal-400/10' :
                        l.ai_confidence >= 0.5 ? 'text-amber-400 bg-amber-400/10' :
                        'text-slate-500 bg-slate-500/10'
                      )}>
                        {Math.round(l.ai_confidence * 100)}% conf
                      </span>
                    )}
                    {l.source_doc && (
                      <a
                        href={l.source_doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        SEC →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
