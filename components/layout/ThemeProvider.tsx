'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
type ThemeMode = 'auto' | 'dark' | 'light';

const ThemeCtx = createContext<{ theme: Theme; mode: ThemeMode; toggle: () => void }>({
  theme: 'dark', mode: 'auto', toggle: () => {},
});

function isDaylight(lat: number, lng: number): boolean {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const decl = -23.45 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)) * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const cosHA =
    (Math.sin(-0.01454) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));
  if (Math.abs(cosHA) > 1) return cosHA < -1;
  const ha = Math.acos(cosHA);
  const noon = 12 - lng / 15;
  const rise = noon - (ha * 12) / Math.PI;
  const set = noon + (ha * 12) / Math.PI;
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  return h >= rise && h < set;
}

function computeAutoTheme(pos: GeolocationPosition | null): Theme {
  if (!pos) {
    // Fallback: use system preference
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return isDaylight(pos.coords.latitude, pos.coords.longitude) ? 'light' : 'dark';
}

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('light', t === 'light');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<Theme>('dark');
  const [geo, setGeo] = useState<GeolocationPosition | null>(null);

  // On mount: load saved mode, get geolocation for auto mode
  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    const initialMode: ThemeMode = saved ?? 'auto';
    setMode(initialMode);

    if (initialMode !== 'auto') {
      const t = initialMode as Theme;
      setTheme(t);
      applyTheme(t);
      return;
    }

    // Auto: try geolocation first, then fall back to system
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGeo(pos);
          const t = computeAutoTheme(pos);
          setTheme(t);
          applyTheme(t);
        },
        () => {
          const t = computeAutoTheme(null);
          setTheme(t);
          applyTheme(t);
        },
        { timeout: 5000 }
      );
    } else {
      const t = computeAutoTheme(null);
      setTheme(t);
      applyTheme(t);
    }
  }, []);

  // Re-check every 5 minutes in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;
    const id = setInterval(() => {
      const t = computeAutoTheme(geo);
      setTheme(t);
      applyTheme(t);
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [mode, geo]);

  function toggle() {
    setMode(prev => {
      // cycle: auto → light → dark → auto
      const next: ThemeMode = prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto';
      localStorage.setItem('themeMode', next);
      if (next === 'auto') {
        const t = computeAutoTheme(geo);
        setTheme(t);
        applyTheme(t);
      } else {
        const t = next as Theme;
        setTheme(t);
        applyTheme(t);
      }
      return next;
    });
  }

  return <ThemeCtx.Provider value={{ theme, mode, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() { return useContext(ThemeCtx); }
