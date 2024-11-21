/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E60012',
        secondary: '#000000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}