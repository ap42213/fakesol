/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solana: {
          purple: '#9945FF',
          green: '#14F195',
          dark: '#0D1117',
        },
        background: '#09090b',
        'background-lighter': '#18181b',
        'background-card': '#27272a',
        primary: '#9945FF',
        'primary-light': '#B980FF',
        secondary: '#14F195',
        text: '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
