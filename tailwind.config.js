/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4A5D4E', // Sage Green
          dark: '#2D362E',    // Deep Forest
          light: '#F2F0E9',   // Warm Stone
          mid: '#C68B59',     // Ochre
        },
        cream: '#FAF9F6',
        warm: '#F2F0E9',
        text: {
          dark: '#2D2D2D',
          muted: '#5A5A5A',
        },
        border: 'rgba(0, 0, 0, 0.08)',
        white: '#ffffff',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
        softLg: '0 18px 50px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
