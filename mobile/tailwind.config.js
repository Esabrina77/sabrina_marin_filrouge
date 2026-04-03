/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fika: {
          primary: '#2D5A27',
          light: '#F0FDF4',
          accent: '#166534',
        },
        slate: {
          100: '#f1f5f9',
        }
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
