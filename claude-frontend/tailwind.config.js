/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode will be controlled using the "dark" class on <html>
  darkMode: 'class',

  content: ['./index.html', './src/**/*.{js,jsx}'],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00685F',
          50: '#e6f2f1',
          100: '#c0dedb',
          200: '#96c9c3',
          300: '#6bb3ab',
          400: '#4aa39a',
          500: '#00685F',
          600: '#005b53',
          700: '#004d46',
          800: '#003f3a',
          900: '#00302c',
        },

        navy: '#0f2027',

        surface: '#f4f6f8',

        lavender: '#f6f5fb',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        card: '0 2px 10px rgba(15, 32, 39, 0.06)',
        cardHover: '0 8px 24px rgba(15, 32, 39, 0.10)',
      },

      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },

  plugins: [],
}