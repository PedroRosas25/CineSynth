/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cine-bg': '#0a0a0a',
        'cine-panel': '#171717',
        'cine-accent': '#dc2626',
        'cine-accent-hover': '#b91c1c',
      },
      keyframes: {
        'marquee-vertical': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' }, // Mueve la mitad para el efecto infinito
        },
      },
      animation: {
        'marquee-vertical': 'marquee-vertical linear infinite',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}