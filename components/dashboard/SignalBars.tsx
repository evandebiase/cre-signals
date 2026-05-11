'use client';

import { SignalScore, getBand } from '@/components/ui/SignalScore';

type Props = {
  score: number;
  label?: string;
};

export function SignalBars({ score, label }: Props) {
  const band = getBand(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <SignalScore score={score} size="lg" />
      {label && <span className={`text-xs font-mono font-bold`} style={{ color: 'inherit' }}>{band.label}</span>}
    </div>
  );
}
