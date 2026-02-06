/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#f4d03f',
          dark: '#b8941f',
        },
        background: 'hsl(var(--background, 222 47% 11%))',
        foreground: 'hsl(var(--foreground, 0 0% 100%))',
        destructive: 'hsl(var(--destructive, 0 84% 60%))',
        muted: 'hsl(var(--muted, 217 33% 17%))',
        'muted-foreground': 'hsl(var(--muted-foreground, 215 20% 65%))',
      },
      boxShadow: {
        gold: '0 20px 40px rgba(212, 175, 55, 0.1)',
        'gold-lg': '0 25px 50px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
}
