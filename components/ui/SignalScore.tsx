'use client';

import { clsx } from 'clsx';

type Props = {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

const BANDS = [
  { min: 0, max: 29, label: 'Quiet', color: 'bg-gray-500' },
  { min: 30, max: 49, label: 'Low', color: 'bg-blue-500' },
  { min: 50, max: 64, label: 'Moderate', color: 'bg-amber-400' },
  { min: 65, max: 79, label: 'Elevated', color: 'bg-orange-500' },
  { min: 80, max: 100, label: 'High', color: 'bg-red-500' },
] as const;

export function getBand(score: number) {
  return BANDS.find(b => score >= b.min && score <= b.max) ?? BANDS[0];
}

export function SignalScore({ score, size = 'md', showLabel = false }: Props) {
  const band = getBand(score);
  const bars = 5;
  const filledBars = Math.ceil((score / 100) * bars);

  const barW = size === 'sm' ? 'w-1.5' : size === 'lg' ? 'w-3' : 'w-2';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';

  return (
    <div className="flex items-end gap-2">
      <div className={clsx('flex items-end', gap)}>
        {Array.from({ length: bars }).map((_, i) => {
          const filled = i < filledBars;
          const heightPercent = 40 + i * 15;
          return (
            <div
              key={i}
              className={clsx(barW, 'rounded-sm', filled ? band.color : 'bg-navy-700')}
              style={{ height: `${heightPercent}%`, minHeight: size === 'sm' ? 4 : 6, maxHeight: size === 'lg' ? 24 : 16 }}
            />
          );
        })}
      </div>
      {showLabel && (
        <span className={clsx('font-mono font-semibold', size === 'sm' ? 'text-xs' : 'text-sm', `text-${band.color.replace('bg-', '')}`)}>
          {score}
        </span>
      )}
      {showLabel && (
        <span className="text-xs text-slate-400">{band.label}</span>
      )}
    </div>
  );
}
