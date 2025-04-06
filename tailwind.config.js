/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      screens: {
        'xl': '1280px',  
        '2xl': '1536px',  
        '3xl': '1920px',  
      }
    },
  },
  plugins: [],
}

