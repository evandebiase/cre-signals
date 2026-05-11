'use client';

import { useEffect, useState } from 'react';

type Props = { zip: string };

export function MarketNarrative({ zip }: Props) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error === 'AI service not configured'
          ? 'AI narrative requires an Anthropic API key — add ANTHROPIC_API_KEY in Vercel settings.'
          : (data.error ?? 'Failed to generate narrative.');
        setError(msg);
        return;
      }
      setNarrative(data.narrative ?? null);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [zip]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-11/12" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 py-4">
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={load} className="text-teal-400 text-sm hover:text-teal-300 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!narrative) return null;

  const paragraphs = narrative.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-slate-300 text-sm leading-relaxed">{para}</p>
      ))}
      <div className="flex items-center gap-2 pt-2 border-t border-navy-700">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-xs text-slate-500">AI-generated · Updated every 24 hours</span>
        <button onClick={load} className="ml-auto text-xs text-teal-400 hover:text-teal-300 transition-colors">
          Refresh
        </button>
      </div>
    </div>
  );
}
