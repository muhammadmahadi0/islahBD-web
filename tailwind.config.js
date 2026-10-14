/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0E7C5B", dark: "#0A5C44", light: "#E6F4EE" },
        gold: { DEFAULT: "#C9A227", light: "#F7EFD2" },
        ivory: "#FAF7EF",
        ink: "#10231C",
      },
      fontFamily: {
        bengali: ["Kalpurush", "Inter", "sans-serif"],
        arabic: ["ScheherazadeNew", "serif"],
        inter: ["Inter", "sans-serif"],
        display: ["AbrilFatface", "serif"],
      },
    },
  },
  plugins: [],
};
