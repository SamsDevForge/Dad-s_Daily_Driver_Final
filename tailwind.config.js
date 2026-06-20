/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-bg': '#F6F3EE',
        'surface': '#FFFFFF',
        'primary': '#B8860B',
        'secondary': '#4F6D5A',
        'text-deep': '#1F2937',
        'text-muted': '#6B7280',
        'alert': '#D97706',
        'success': '#4F6D5A',
        'tag-family': '#D4A373',
        'tag-health': '#6A994E',
        'tag-work': '#457B9D',
        'tag-bills': '#E76F51',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.08), 0 4px 12px -5px rgba(0,0,0,0.04)',
        'premium-sm': '0 4px 12px -2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
