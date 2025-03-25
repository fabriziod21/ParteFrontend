const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["src/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    altp: "560px",
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        bungee: ['Bungee Tint', 'cursive'],
        teko: ['Teko', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
      },
      colors: {
        fondo: 'rgb(27, 25, 24)',
        bgper: 'rgb(12, 10, 9)',
       
        
    },
    borderWidth: {
      // Agregar el grosor del borde aquí
      '0.5': '0.5px',
      '1.5': '1.5px',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '6': '6px',
      '8': '8px',
      '10': '10px',
      '12': '12px', // Añadir aquí para bordes de 12px
      '16': '16px', // Puedes añadir más si es necesario
    },
    
  },
  plugins: [require("tailwindcss-animate")],
}
}
