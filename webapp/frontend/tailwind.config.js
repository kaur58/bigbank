/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#101410', 950: '#101410', 900: '#141a15', 800: '#171d18', 700: '#20251b' },
        parchment: { DEFAULT: '#e9e5d9', muted: '#aaa994' },
        gold: { DEFAULT: '#c7a66f', soft: '#d3b87c' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
