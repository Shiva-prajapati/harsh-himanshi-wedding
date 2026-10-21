/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#6B1A2C',
          dark: '#4A0E1C',
          deep: '#300610',
        },
        gold: {
          light: '#F3E5AB',
          DEFAULT: '#C9A84C',
          antique: '#B8962E',
          bright: '#FFDF73',
        },
        ivory: '#FFF8F0',
        cream: '#F5E6D3',
        navy: {
          DEFAULT: '#0D1B2A',
          dark: '#070D15',
        },
        rose: {
          DEFAULT: '#E8A0A0',
          deep: '#D47A88',
        },
      },
      fontFamily: {
        royal: ['var(--font-royal)', 'serif'],
        serif: ['var(--font-body)', 'serif'],
        hindi: ['var(--font-hindi)', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
        sans: ['var(--font-ui)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
