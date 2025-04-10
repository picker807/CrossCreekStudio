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
      },
      colors: {
        'ccs-green-mint': '#58c2c0',
        'ccs-green': '#59c58d',
        'ccs-blue': '#5891c3',
        'ccs-beige': '#f9e8d9',
        'ccs-brown': '#342c25',
        'ccs-lt-brown': '#9c8571',
        'ccs-dk-gray': '#362e27'
      }
    },
  },
  plugins: [],
}

