import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050810',
          900: '#0A0F1E',
          800: '#0D1530',
          700: '#111B3D',
          600: '#162149',
        },
        teal: {
          400: '#00D4AA',
          500: '#00B894',
          600: '#00A080',
        },
        amber: {
          400: '#F59E0B',
          500: '#D97706',
        },
        signal: {
          quiet: '#6B7280',
          low: '#3B82F6',
          moderate: '#F59E0B',
          elevated: '#F97316',
          high: '#EF4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
