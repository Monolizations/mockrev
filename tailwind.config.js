/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        mist: '#eef3f7',
        signal: '#0f766e',
        brass: '#b7791f',
        berry: '#9f1239',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(23, 32, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
