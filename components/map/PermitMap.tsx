'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';

type ZipDatum = {
  zip: string;
  score: number;
  lat: number;
  lng: number;
  pctChange?: number | null;
  interpretation?: string | null;
  permitVolume?: number | null;
  vacancyLevel?: number | null;
  leaseDensity?: number | null;
};

type Props = { zipData: ZipDatum[] };

function scoreColor(score: number): string {
  if (score >= 80) return '#EF4444';
  if (score >= 65) return '#F97316';
  if (score >= 50) return '#F59E0B';
  if (score >= 30) return '#3B82F6';
  return '#6B7280';
}

function scoreBand(score: number): string {
  if (score >= 80) return 'High';
  if (score >= 65) return 'Elevated';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Low';
  return 'Quiet';
}

function popupHTML(d: ZipDatum): string {
  const color = scoreColor(d.score);
  const band = scoreBand(d.score);
  const trend = d.pctChange !== null && d.pctChange !== undefined
    ? `<span style="color:${d.pctChange >= 0 ? '#34D399' : '#F87171'};font-size:11px">${d.pctChange >= 0 ? '↑' : '↓'}${Math.abs(d.pctChange).toFixed(1)}% 30d</span>`
    : '';
  const interp = d.interpretation
    ? `<div style="color:#94A3B8;font-size:11px;line-height:1.5;margin-top:8px;border-top:1px solid #1e2d4a;padding-top:8px">${d.interpretation}</div>`
    : '';

  const bar = (label: string, val: number | null | undefined) => val !== null && val !== undefined ? `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
      <span style="color:#64748B;font-size:10px">${label}</span>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:48px;height:3px;background:#1e2d4a;border-radius:2px;overflow:hidden">
          <div style="width:${val}%;height:100%;background:${color};border-radius:2px"></div>
        </div>
        <span style="color:#CBD5E1;font-size:10px;font-family:monospace">${val}</span>
      </div>
    </div>` : '';

  return `
    <div style="background:#0A0F1E;border:1px solid #162149;border-radius:10px;padding:14px;font-family:-apple-system,sans-serif;min-width:200px;max-width:240px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="color:#00D4AA;font-weight:700;font-size:18px;font-family:monospace">${d.zip}</span>
        ${trend}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="width:10px;height:10px;border-radius:50%;background:${color}"></div>
        <span style="color:${color};font-weight:600;font-size:13px">${d.score}</span>
        <span style="color:#475569;font-size:12px">${band}</span>
      </div>
      ${bar('Permit Vol', d.permitVolume)}
      ${bar('Vacancy', d.vacancyLevel)}
      ${bar('Lease Density', d.leaseDensity)}
      ${interp}
      <a href="/explorer/${d.zip}" style="color:#00D4AA;font-size:11px;display:block;margin-top:10px;text-align:right;text-decoration:none">
        Full analysis →
      </a>
    </div>
  `;
}

export function PermitMap({ zipData }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) { setError(true); return; }

    let map: mapboxgl.Map | null = null;

    async function initMap() {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

        const style = theme === 'light'
          ? 'mapbox://styles/mapbox/light-v11'
          : 'mapbox://styles/mapbox/dark-v11';

        map = new mapboxgl.Map({
          container: mapRef.current!,
          style,
          center: [-98.35, 39.5],
          zoom: 3.8,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        map.on('load', () => {
          setMapLoaded(true);
          if (!map || zipData.length === 0) return;

          const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: zipData.map(z => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [z.lng, z.lat] },
              properties: {
                zip: z.zip, score: z.score,
                pctChange: z.pctChange ?? null,
                interpretation: z.interpretation ?? '',
                permitVolume: z.permitVolume ?? null,
                vacancyLevel: z.vacancyLevel ?? null,
                leaseDensity: z.leaseDensity ?? null,
              },
            })),
          };

          map.addSource('zips', { type: 'geojson', data: geojson });

          // Glow layer (larger, transparent)
          map.addLayer({
            id: 'zip-glow',
            type: 'circle',
            source: 'zips',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['get', 'score'], 0, 18, 100, 52],
              'circle-color': [
                'interpolate', ['linear'], ['get', 'score'],
                0, '#6B7280', 30, '#3B82F6', 50, '#F59E0B', 65, '#F97316', 80, '#EF4444',
              ],
              'circle-opacity': 0.15,
              'circle-blur': 1,
            },
          });

          // Core dot
          map.addLayer({
            id: 'zip-dot',
            type: 'circle',
            source: 'zips',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['get', 'score'], 0, 6, 100, 22],
              'circle-color': [
                'interpolate', ['linear'], ['get', 'score'],
                0, '#6B7280', 30, '#3B82F6', 50, '#F59E0B', 65, '#F97316', 80, '#EF4444',
              ],
              'circle-opacity': 0.9,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': 'rgba(255,255,255,0.25)',
            },
          });

          // Zip label
          map.addLayer({
            id: 'zip-label',
            type: 'symbol',
            source: 'zips',
            layout: {
              'text-field': ['get', 'zip'],
              'text-size': 10,
              'text-offset': [0, 1.8],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': theme === 'light' ? '#334155' : '#94A3B8',
              'text-halo-color': theme === 'light' ? '#f8fafc' : '#0A0F1E',
              'text-halo-width': 1,
            },
          });

          // Popup on click
          const popup = new mapboxgl.Popup({ closeButton: true, maxWidth: '260px', className: 'cre-popup' });

          map.on('click', 'zip-dot', e => {
            if (!e.features?.[0] || !map) return;
            const props = e.features[0].properties as ZipDatum & { score: number };
            const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];
            popup.setLngLat(coords).setHTML(popupHTML(props)).addTo(map);
          });

          map.on('mouseenter', 'zip-dot', () => { if (map) map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', 'zip-dot', () => { if (map) map.getCanvas().style.cursor = ''; });
        });
      } catch {
        setError(true);
      }
    }

    initMap();
    return () => { map?.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipData, theme]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-navy-800 rounded-xl border border-navy-700">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-slate-400 text-sm">Map requires a Mapbox token</p>
        <p className="text-slate-600 text-xs mt-1">Set NEXT_PUBLIC_MAPBOX_TOKEN in Vercel env vars</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-navy-700" style={{ height: 520 }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-navy-800 flex items-center justify-center">
          <div className="skeleton w-full h-full" />
        </div>
      )}
    </div>
  );
}
