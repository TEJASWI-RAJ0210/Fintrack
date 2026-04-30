/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['DM Sans',           'sans-serif'],
        mono:    ['JetBrains Mono',    'monospace'],
      },
      colors: {
        'bg-base':       '#0A0A0F',
        'bg-surface':    '#12121A',
        'bg-elevated':   '#1A1A26',
        'border-subtle': '#2A2A3A',
        'border-active': '#3A3A52',
        accent: {
          DEFAULT: '#22C55E',
          dim:     '#16A34A',
          glow:    'rgba(34,197,94,0.15)',
        },
        'text-primary':   '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted':     '#475569',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'accent-glow': '0 0 20px rgba(34,197,94,0.25)',
        'card':        '0 1px 3px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}