/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
}
