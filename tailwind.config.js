/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        base: '#0D0A0F',
        surface: '#13101A',
        surface2: '#1A1525',
        text: '#F0EAFB',
        'text-dim': 'rgba(240,234,248,0.55)',
        'text-muted': '#6A5E7A',
      },
      borderRadius: {
        card: '12px',
        btn: '7px',
        badge: '4px',
      },
    },
  },
  plugins: [],
}


