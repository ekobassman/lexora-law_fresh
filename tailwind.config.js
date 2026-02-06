/** @type {import('tailwindcss').Config} - Lexora Premium from lexora-law-main */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1280px" },
    },
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        navy: "hsl(var(--navy))",
        "navy-medium": "#1e293b",
        graphite: "hsl(var(--graphite))",
        ivory: "hsl(var(--ivory))",
        gold: "hsl(var(--gold))",
        "gold-hover": "#b8941d",
        "beige-cream": "#f5f5f0",
        "beige-chat": "#f5f0e6",
        "gray-body": "#4b5563",
        "gray-muted": "#9ca3af",
        green: "hsl(var(--green))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        balance: {
          "0%, 100%": { transform: "rotate(-8deg) scale(1)" },
          "25%": { transform: "rotate(0deg) scale(1.05)" },
          "50%": { transform: "rotate(8deg) scale(1)" },
          "75%": { transform: "rotate(0deg) scale(1.05)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        balance: "balance 1.5s ease-in-out infinite",
      },
      maxWidth: {
        "7xl": "80rem",
      },
      boxShadow: {
        premium: "0 4px 20px -4px rgba(11, 28, 45, 0.15), 0 8px 40px -8px rgba(201, 162, 77, 0.1)",
        gold: "0 20px 40px rgba(212, 175, 55, 0.1)",
        "gold-lg": "0 25px 50px rgba(212, 175, 55, 0.2)",
      },
    },
  },
  plugins: [],
}
