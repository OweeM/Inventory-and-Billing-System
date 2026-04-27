/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Add your file paths here
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"], // Montserrat font
        notosans: ["Noto Sans", "sans-serif"],   // Noto Sans font
      },
    },
  },
  plugins: [],
};
