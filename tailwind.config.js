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
        background: 'hsl(var(--background, 210 40% 8%))',
        foreground: 'hsl(var(--foreground, 0 0% 98%))',
        destructive: 'hsl(var(--destructive, 0 84% 60%))',
        muted: 'hsl(var(--muted, 210 40% 15%))',
        'muted-foreground': 'hsl(var(--muted-foreground, 210 20% 65%))',
      },
    },
  },
  plugins: [],
}
