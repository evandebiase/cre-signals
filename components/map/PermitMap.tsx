'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  zipData: { zip: string; score: number; lat: number; lng: number }[];
};

export function PermitMap({ zipData }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setError(true);
      return;
    }

    let map: mapboxgl.Map | null = null;

    async function initMap() {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

        map = new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-98.35, 39.5],
          zoom: 3.5,
        });

        map.on('load', () => {
          setMapLoaded(true);

          if (!map || zipData.length === 0) return;

          const geojson = {
            type: 'FeatureCollection' as const,
            features: zipData.map(z => ({
              type: 'Feature' as const,
              geometry: { type: 'Point' as const, coordinates: [z.lng, z.lat] },
              properties: { zip: z.zip, score: z.score },
            })),
          };

          map.addSource('zips', { type: 'geojson', data: geojson });

          map.addLayer({
            id: 'zip-heat',
            type: 'circle',
            source: 'zips',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['get', 'score'], 0, 8, 100, 30],
              'circle-color': [
                'interpolate', ['linear'], ['get', 'score'],
                0, '#6B7280',
                30, '#3B82F6',
                50, '#F59E0B',
                65, '#F97316',
                80, '#EF4444',
              ],
              'circle-opacity': 0.75,
              'circle-blur': 0.5,
            },
          });

          // Popup on click
          map.on('click', 'zip-heat', e => {
            if (!e.features?.[0] || !map) return;
            const { zip, score } = e.features[0].properties as { zip: string; score: number };
            const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];

            new mapboxgl.Popup({ closeButton: false, className: 'cre-popup' })
              .setLngLat(coords)
              .setHTML(`
                <div style="background:#0D1530;border:1px solid #162149;border-radius:8px;padding:12px;font-family:monospace">
                  <div style="color:#00D4AA;font-weight:700;font-size:16px">${zip}</div>
                  <div style="color:#E2E8F0;margin-top:4px">Signal Score: <span style="color:#F59E0B;font-weight:600">${score}</span></div>
                  <a href="/explorer/${zip}" style="color:#00D4AA;font-size:12px;display:block;margin-top:8px">View details →</a>
                </div>
              `)
              .addTo(map);
          });

          map.on('mouseenter', 'zip-heat', () => { if (map) map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', 'zip-heat', () => { if (map) map.getCanvas().style.cursor = ''; });
        });
      } catch {
        setError(true);
      }
    }

    initMap();
    return () => { map?.remove(); };
  }, [zipData]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-navy-800 rounded-xl border border-navy-700">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-slate-400 text-sm">Map requires a Mapbox token</p>
        <p className="text-slate-600 text-xs mt-1">Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-navy-700" style={{ height: 560 }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-navy-800 flex items-center justify-center">
          <div className="skeleton w-full h-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
