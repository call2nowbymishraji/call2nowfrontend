/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        gblue: '#4285F4',
        gred: '#EA4335',
        gyellow: '#FBBC05',
        ggreen: '#34A853',
        surface: '#f5f7fa',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(60,64,67,.15), 0 4px 16px rgba(60,64,67,.08)',
        pill: '0 2px 10px rgba(60,64,67,.12)',
      },
    },
  },
  plugins: [],
};
