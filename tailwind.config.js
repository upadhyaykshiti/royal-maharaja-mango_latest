/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mango: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        royal: {
          50: '#fdf8ee',
          100: '#f9ecd4',
          200: '#f2d5a0',
          300: '#e9b864',
          400: '#e09a35',
          500: '#d4801a',
          600: '#b96113',
          700: '#984813',
          800: '#7c3a15',
          900: '#663214',
        },
        forest: {
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#081c15',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Lato', 'sans-serif'],
        accent: ['Satisfy', 'cursive'],
      },
    },
  },
  plugins: [],
}
