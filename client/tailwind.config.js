/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#6366f1',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
          950: '#0f0e26',
        },
        surface: {
          950: '#ffffff',
          900: '#f8fafc',
          850: '#f1f5f9',
          800: '#ffffff',
          750: '#f8fafc',
          700: '#e2e8f0',
          600: '#cbd5e1',
          500: '#94a3b8',
        },
        gray: {
          50:  '#0f172a',
          100: '#0f172a', // primary text - crisp dark
          200: '#1e293b', // secondary dark text
          300: '#334155', // regular body text
          400: '#64748b', // muted text / slate-500
          500: '#64748b', // labels / placeholders
          600: '#94a3b8', // subtle text / slate-400
          700: '#cbd5e1', // subtle borders / slate-300
          750: '#e2e8f0', // hover backgrounds / slate-200
          800: '#f1f5f9', // subpanel backgrounds / slate-100
          850: '#f8fafc', // input & table header backgrounds / slate-50
          900: '#ffffff', // card backgrounds
          950: '#ffffff', // sidebar & main canvas
        },
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#059669',
          500: '#10b981',
          600: '#047857',
          700: '#065f46',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        'success-gradient': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      },
      boxShadow: {
        'glow-brand': '0 4px 16px rgba(79,70,229,0.18)',
        'glow-success': '0 4px 16px rgba(16,185,129,0.18)',
        'card': '0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)',
        'card-hover': '0 10px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
