/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#0F172A',
          'sidebar-hover': '#1E293B',
          'sidebar-active': '#1D4ED8',
          elevated: '#F1F5F9',
          border: '#E2E8F0',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          faint: '#94A3B8',
          sidebar: '#CBD5E1',
          'sidebar-muted': '#64748B',
        },
        brand: {
          DEFAULT: '#1D4ED8',
          light: '#3B82F6',
          muted: '#EFF6FF',
          border: '#BFDBFE',
        },
        signal: {
          red: '#EF4444',
          'red-bg': '#FEF2F2',
          'red-border': '#FECACA',
          orange: '#F97316',
          'orange-bg': '#FFF7ED',
          'orange-border': '#FED7AA',
          amber: '#F59E0B',
          'amber-bg': '#FFFBEB',
          'amber-border': '#FDE68A',
          green: '#10B981',
          'green-bg': '#ECFDF5',
          'green-border': '#A7F3D0',
          blue: '#3B82F6',
          'blue-bg': '#EFF6FF',
          'blue-border': '#BFDBFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        },
        riseIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-8px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        riseIn: 'riseIn 0.3s ease-out',
        slideIn: 'slideIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
