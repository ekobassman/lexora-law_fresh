/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1C2D',
          light: '#122536',
          dark: '#0D1F30',
        },
        gold: {
          DEFAULT: '#C9A24D',
          light: '#E0C068',
          dark: '#A8863D',
        },
      },
    },
  },
  plugins: [],
}
