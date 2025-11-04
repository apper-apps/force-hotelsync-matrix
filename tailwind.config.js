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
          50: '#f0f8ff',
          100: '#dbeeff',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        navy: {
          50: '#e8f0f5',
          100: '#c5d9e8',
          200: '#a1c2da',
          300: '#7eabcd',
          400: '#5a94c0',
          500: '#1e3a5f',
          600: '#1a324f',
          700: '#15293f',
          800: '#11212f',
          900: '#0c181f',
        },
        amber: {
          50: '#fef9e7',
          100: '#fdf2c4',
          200: '#fceb9f',
          300: '#fbe479',
          400: '#fade53',
          500: '#f39c12',
          600: '#d68910',
          700: '#b9760e',
          800: '#9c630c',
          900: '#7f500a',
        }
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}