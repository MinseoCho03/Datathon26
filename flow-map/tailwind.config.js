/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1628',
          800: '#0e1f34',
          700: '#112b40',
          600: '#153347',
        },
        panel: '#132235',
        'panel-soft': '#0f1d2e',
        blue: { DEFAULT: '#2366c9', soft: 'rgba(35,102,201,0.12)' },
        teal: { DEFAULT: '#0d846a', soft: 'rgba(13,132,106,0.12)' },
      },
    },
  },
  plugins: [],
}
