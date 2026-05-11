import { SignalFeed } from '@/components/dashboard/SignalFeed';

export const metadata = { title: 'Signal Feed — CRE Signals' };

export default function DashboardPage() {
  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Signal Feed</h1>
          <p className="text-slate-500 text-sm mt-1">
            AI-curated market signals for your watched zip codes
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Live · Updated nightly
        </div>
      </div>

      <SignalFeed />
    </div>
  );
}
