/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D35400',
          light: '#E67E22',
        },
        secondary: '#2C3E50',
        accent: '#F39C12',
        bg: {
          light: '#FDFEFE',
          dark: '#1A1A1A',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
