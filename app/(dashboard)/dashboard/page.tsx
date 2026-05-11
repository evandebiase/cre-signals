import { SignalFeed } from '@/components/dashboard/SignalFeed';

export const metadata = { title: 'Signal Feed — CRE Data' };

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Signal Feed</h1>
          <p className="text-slate-500 text-sm mt-1">AI-curated market signals for your watched zip codes</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 font-mono flex-shrink-0 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="hidden sm:inline">Live · Updated nightly</span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>
      <SignalFeed />
    </div>
  );
}
