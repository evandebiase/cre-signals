import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { ZipOverview } from '@/components/explorer/ZipOverview';
import { PermitTable } from '@/components/explorer/PermitTable';
import { MarketNarrative } from '@/components/explorer/MarketNarrative';
import { getSignalHistoryForZip, getPermitsByZip } from '@/lib/db/queries';

type Props = { params: { zip: string } };

export async function generateMetadata({ params }: Props) {
  return { title: `${params.zip} Market Intelligence — CRE Data` };
}

export default async function ZipExplorerPage({ params }: Props) {
  const { zip } = params;

  if (!/^\d{5}$/.test(zip)) notFound();

  const [signals, permits] = await Promise.all([
    getSignalHistoryForZip(zip, 365),
    getPermitsByZip(zip, 50),
  ]);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 font-mono">{zip}</h1>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-slate-400 text-sm">Zip Code Explorer</span>
          </div>
          <p className="text-slate-600 text-sm">
            {signals.length} signal snapshots · {permits.length} permit filings
          </p>
        </div>
      </div>

      {/* Overview */}
      {signals.length > 0 ? (
        <ZipOverview zip={zip} signals={signals} />
      ) : (
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-400">No signal data yet for {zip}.</p>
          <p className="text-slate-600 text-sm mt-1">Add this zip to your watchlist to start tracking.</p>
        </div>
      )}

      {/* AI Narrative */}
      <section className="bg-navy-800 border border-navy-700 rounded-xl p-6">
        <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
          <span className="text-teal-400">✦</span> AI Market Narrative
        </h2>
        <MarketNarrative zip={zip} />
      </section>

      {/* Permit Table */}
      <section className="bg-navy-800 border border-navy-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-200 font-semibold">Recent Permit Filings</h2>
          <span className="text-slate-600 text-xs font-mono">{permits.length} filings</span>
        </div>
        <PermitTable permits={permits} />
      </section>
    </div>
  );
}
