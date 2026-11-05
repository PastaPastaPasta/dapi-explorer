/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--dh-font)'], mono: ['var(--dh-mono)'] },
      colors: {
        page: 'var(--dh-page)', surface: 'var(--dh-surface)', ink: 'var(--dh-ink)',
        muted: 'var(--dh-ink-2)', line: 'var(--dh-line)',
        gray: { 50: 'var(--dh-page)', 100: 'var(--dh-sunken)', 200: 'var(--dh-line)', 300: 'var(--dh-line-2)', 400: 'var(--dh-ink-2)', 500: 'var(--dh-ink-2)', 600: 'var(--dh-ink-2)', 700: 'var(--dh-ink)', 800: 'var(--dh-ink)', 900: 'var(--dh-ink)' },
        white: 'var(--dh-surface)',
        green: { 50: 'var(--dh-good-soft)', 100: 'var(--dh-good-soft)', 400: 'var(--dh-good)', 500: 'var(--dh-good)', 600: 'var(--dh-good)', 700: 'var(--dh-good)' },
        red: { 50: 'var(--dh-bad-soft)', 500: 'var(--dh-bad)', 600: 'var(--dh-bad)' },
        yellow: { 600: 'var(--dh-warn)' },
        brand: 'var(--dh-brand-ink)',
      },
    },
  },
  plugins: [],
};
