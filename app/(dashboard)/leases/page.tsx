import { getAllUpcomingLeases } from '@/lib/db/queries';
import { LeaseCalendar } from '@/components/leases/LeaseCalendar';
import { PlanGate } from '@/components/ui/PlanGate';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Lease Expiration Radar — CRE Signals' };

export default async function LeasesPage() {
  const leases = await getAllUpcomingLeases();

  return (
    <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Lease Expiration Radar</h1>
          <p className="text-slate-500 text-sm mt-1">
            SEC 10-K sourced lease expirations — clustered by quarter
          </p>
        </div>
        <PlanGate requiredPlan="pro" fallback={
          <div className="text-xs text-amber-400 border border-amber-400/30 rounded-lg px-3 py-1.5 bg-amber-400/5">
            Pro required for CSV export
          </div>
        }>
          <button className="text-xs text-slate-300 border border-navy-700 rounded-lg px-3 py-1.5 hover:border-teal-400/30 transition-colors">
            Export CSV →
          </button>
        </PlanGate>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Total Expirations</div>
          <div className="font-mono text-2xl font-bold text-slate-100">{leases.length}</div>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Total Sqft Expiring</div>
          <div className="font-mono text-2xl font-bold text-teal-400">
            {((leases.reduce((s, l) => s + (l.sq_footage ?? 0), 0)) / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Urgent (&lt;6 mo)</div>
          <div className="font-mono text-2xl font-bold text-red-400">
            {leases.filter(l => {
              if (!l.expiration_quarter) return false;
              const [q, y] = l.expiration_quarter.split(' ');
              const qNum = parseInt(q.replace('Q', ''));
              const d = new Date(parseInt(y), (qNum - 1) * 3, 1);
              return (d.getTime() - Date.now()) < 180 * 86400000;
            }).length}
          </div>
        </div>
      </div>

      <LeaseCalendar leases={leases} />
    </div>
  );
}
