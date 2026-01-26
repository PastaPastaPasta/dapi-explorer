/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dash: {
          blue: '#008de4',
          dark: '#0b6cc0',
        },
      },
    },
  },
  plugins: [],
};
