/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F5EF',
        ink: '#16233B',
        mute: '#5B6577',
        rule: '#E4DED2',
        acc: '#0E6B62',
        accsoft: '#E3F0EE',
        ok: '#1F6B3A',
        oksoft: '#E4F1E8',
        warn: '#8A5A00',
        warnsoft: '#FBF1DC',
        bad: '#A12B2B',
        badsoft: '#F9E5E3',
        info: '#274C8C',
        infosoft: '#E6ECF7',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

