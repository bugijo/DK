/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'text-base': 'var(--color-text-base)',
        'text-muted': 'var(--color-text-muted)',
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
      },
      fontFamily: {
        'title': 'var(--font-title)',
        'body': 'var(--font-body)',
      }
    },
  },
  plugins: [],
}