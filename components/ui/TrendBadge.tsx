import { clsx } from 'clsx';

type Props = {
  value: number | null;
  suffix?: string;
  className?: string;
};

export function TrendBadge({ value, suffix = '%', className }: Props) {
  if (value === null || value === undefined) {
    return <span className="text-slate-500 text-xs font-mono">—</span>;
  }

  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-1.5 py-0.5 rounded',
        isNeutral && 'text-slate-400 bg-slate-800',
        isPositive && 'text-teal-400 bg-teal-400/10',
        !isPositive && !isNeutral && 'text-red-400 bg-red-400/10',
        className
      )}
    >
      {isPositive ? '↑' : isNeutral ? '→' : '↓'}
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}
