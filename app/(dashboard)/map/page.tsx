import { getTopSignalZips } from '@/lib/db/queries';
import { PermitMap } from '@/components/map/PermitMap';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Signal Map — CRE Data' };

const ZIP_COORDS: Record<string, [number, number]> = {
  '10001': [40.7484, -73.9967],
  '10002': [40.7157, -73.9863],
  '60601': [41.8858, -87.6181],
  '60606': [41.8776, -87.6367],
  '90001': [33.9731, -118.2479],
  '90210': [34.0901, -118.4065],
  '77001': [29.7449, -95.3677],
  '77002': [29.7519, -95.3677],
  '33101': [25.7617, -80.1918],
  '94102': [37.7792, -122.4194],
  '30301': [33.749, -84.388],
};

export default async function MapPage() {
  const signals = await getTopSignalZips(50);

  const zipData = signals.map(s => {
    const coords = ZIP_COORDS[s.zip_code] ?? [39.5, -98.35];
    return {
      zip: s.zip_code,
      score: s.signal_score,
      lat: coords[0],
      lng: coords[1],
      pctChange: s.pct_change_30d,
      interpretation: s.ai_interpretation,
      permitVolume: s.permit_volume_score,
      vacancyLevel: s.vacancy_level_score,
      leaseDensity: s.lease_density_score,
    };
  });

  const avgScore = signals.length
    ? Math.round(signals.reduce((s, z) => s + z.signal_score, 0) / signals.length)
    : 0;
  const hotZips = signals.filter(s => s.signal_score >= 65).length;

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-100">Signal Map</h1>
        <p className="text-slate-500 text-sm mt-1">
          Market activity by zip code — sized and colored by composite signal score
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Zips Tracked</div>
          <div className="font-mono text-2xl font-bold text-slate-100">{signals.length}</div>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Avg Score</div>
          <div className="font-mono text-2xl font-bold text-teal-400">{avgScore}</div>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Elevated+ Zips</div>
          <div className="font-mono text-2xl font-bold text-orange-400">{hotZips}</div>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-4">
          <div className="text-slate-500 text-xs mb-1">Peak Score</div>
          <div className="font-mono text-2xl font-bold text-red-400">
            {signals.length ? Math.max(...signals.map(s => s.signal_score)) : '—'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {[
          { label: 'Quiet', color: '#6B7280' },
          { label: 'Low', color: '#3B82F6' },
          { label: 'Moderate', color: '#F59E0B' },
          { label: 'Elevated', color: '#F97316' },
          { label: 'High', color: '#EF4444' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
            <span className="text-slate-500 text-xs">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <PermitMap zipData={zipData} />
        </div>

        {/* Top zips sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-navy-700">
              <h3 className="text-slate-200 font-semibold text-sm">Top Markets</h3>
              <p className="text-slate-500 text-xs mt-0.5">Ranked by signal score</p>
            </div>
            <div className="divide-y divide-navy-700">
              {signals.slice(0, 10).map((s, i) => {
                const scoreColor =
                  s.signal_score >= 80 ? 'text-red-400' :
                  s.signal_score >= 65 ? 'text-orange-400' :
                  s.signal_score >= 50 ? 'text-amber-400' :
                  s.signal_score >= 30 ? 'text-blue-400' : 'text-slate-500';
                return (
                  <a
                    key={s.zip_code}
                    href={`/explorer/${s.zip_code}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-navy-700/50 transition-colors group"
                  >
                    <span className="text-slate-600 text-xs w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-teal-400 text-sm group-hover:text-teal-300">
                        {s.zip_code}
                      </div>
                      {s.pct_change_30d !== null && (
                        <div className={`text-xs ${s.pct_change_30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {s.pct_change_30d >= 0 ? '↑' : '↓'}{Math.abs(s.pct_change_30d).toFixed(1)}% 30d
                        </div>
                      )}
                    </div>
                    <span className={`font-mono font-bold text-sm flex-shrink-0 ${scoreColor}`}>
                      {s.signal_score}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
