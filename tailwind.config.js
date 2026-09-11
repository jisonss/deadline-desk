/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        canvas: '#f6f4ef',
        surface: '#ffffff',
        ink: '#1b1a17',
        muted: '#6b665d',
        line: '#e4e0d8',
        accent: '#1f6f5c',
        'accent-soft': '#e6efe9',
        urgent: '#b23c22',
        'urgent-soft': '#f6e8e2',
        warn: '#8a6b1f',
      },

      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },

  plugins: [],
}