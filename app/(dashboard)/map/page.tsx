import { getTopSignalZips } from '@/lib/db/queries';
import { PermitMap } from '@/components/map/PermitMap';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Permit Pulse Map — CRE Signals' };

// Approximate zip→lat/lng (real impl would use a full zip code geocoder)
const ZIP_COORDS: Record<string, [number, number]> = {
  '10001': [40.7484, -73.9967],
  '10002': [40.7157, -73.9863],
  '60601': [41.8858, -87.6181],
  '60606': [41.8776, -87.6367],
  '90001': [33.9731, -118.2479],
  '90210': [34.0901, -118.4065],
  '77001': [29.7449, -95.3677],
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
    };
  });

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Permit Pulse Map</h1>
        <p className="text-slate-500 text-sm mt-1">
          Signal strength by zip code — sized and colored by composite score
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5">
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

      <PermitMap zipData={zipData} />
    </div>
  );
}
