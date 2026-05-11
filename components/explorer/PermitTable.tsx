'use client';

import { useState } from 'react';
import type { PermitFiling } from '@/lib/db/queries';
import { format } from 'date-fns';

type Props = { permits: PermitFiling[] };

type SortKey = 'filing_date' | 'estimated_value' | 'permit_type';

const TYPE_COLORS: Record<string, string> = {
  tenant_improvement: 'text-teal-400 bg-teal-400/10',
  new_construction: 'text-blue-400 bg-blue-400/10',
  demolition: 'text-red-400 bg-red-400/10',
  other: 'text-slate-400 bg-slate-400/10',
};

export function PermitTable({ permits }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('filing_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...permits].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sortKey] ?? '';
    const bVal = (b as Record<string, unknown>)[sortKey] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  if (permits.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-8">No permit filings found for this zip code.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-700">
                {(['filing_date', 'permit_type', 'estimated_value'] as SortKey[]).map((key) => {
              const labels: Record<SortKey, string> = { filing_date: 'Date', permit_type: 'Type', estimated_value: 'Value' };
              return (
                <th
                  key={key}
                  className="text-left py-2 px-3 text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none"
                  onClick={() => toggleSort(key)}
                >
                  {labels[key]}<SortIcon k={key} />
                </th>
              );
            })}
            <th className="text-left py-2 px-3 text-slate-500 text-xs uppercase tracking-wider">Address</th>
            <th className="text-left py-2 px-3 text-slate-500 text-xs uppercase tracking-wider">Contractor</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.id} className="border-b border-navy-800 hover:bg-navy-800/50 transition-colors">
              <td className="py-2.5 px-3 font-mono text-slate-400 text-xs">
                {p.filing_date ? format(new Date(p.filing_date), 'MMM d, yyyy') : '—'}
              </td>
              <td className="py-2.5 px-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${TYPE_COLORS[p.permit_type ?? 'other'] ?? TYPE_COLORS.other}`}>
                  {(p.permit_type ?? 'other').replace('_', ' ')}
                </span>
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-300 text-xs">
                {p.estimated_value != null ? `$${p.estimated_value.toLocaleString()}` : '—'}
              </td>
              <td className="py-2.5 px-3 text-slate-400 text-xs max-w-[200px] truncate">{p.address ?? '—'}</td>
              <td className="py-2.5 px-3 text-slate-500 text-xs">{p.contractor_name ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
