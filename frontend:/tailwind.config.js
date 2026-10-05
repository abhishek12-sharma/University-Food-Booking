/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canteen: {
          bg: '#F7F6F1',
          surface: '#FFFFFF',
          ink: '#16211D',
          muted: '#6B7570',
          border: '#E4E2DA',
          primary: '#1F4B3F',
          primaryLight: '#2F6F5C',
          primaryDark: '#12332A',
          accent: '#E3A008',
          accentDark: '#B87F05',
          warn: '#C1432D',
          warnLight: '#FBEAE6',
          ok: '#1F4B3F',
          okLight: '#E7F0EC',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        chip: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 33, 29, 0.06), 0 1px 12px rgba(22, 33, 29, 0.05)',
      },
    },
  },
  plugins: [],
};
