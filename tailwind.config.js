/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0B1120",
          cardDark: "#16202F",
          light: "#FAF8F5",
          cardLight: "#FFFFFF",
          goldStart: "#E6CA65",
          goldEnd: "#B8860B",
        },
        primary: {
          50: "#EEF7F2",
          100: "#D8EDE2",
          200: "#B2DBC6",
          300: "#7FC3A3",
          400: "#4AA67E",
          500: "#1E8A63",
          DEFAULT: "#0E7C5B",
          600: "#0E7C5B",
          700: "#0B6248",
          dark: "#08492F",
          800: "#08492F",
          900: "#063522",
          light: "#E6F4EE",
        },
        gold: {
          light: "#FBF3DC",
          100: "#F7EAC2",
          DEFAULT: "#C9A227",
          500: "#C9A227",
          600: "#A9871E",
          dark: "#7A6415",
        },
        sand: {
          DEFAULT: "#F6F2E9",
          dark: "#ECE5D3",
        },
        ink: {
          DEFAULT: "#14231D",
          soft: "#40544B",
          faint: "#7C8B83",
        },
      },
      fontFamily: {
        bengali: ["Kalpurush", "Inter", "sans-serif"],
        arabic: ["var(--font-arabic)", "ScheherazadeNew", "NotoNastaliqUrdu", "Amiri", "serif"],
        inter: ["Inter", "sans-serif"],
        display: ["AbrilFatface", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(8, 73, 47, 0.05), 0 8px 24px -12px rgba(8, 73, 47, 0.18)",
        lift: "0 2px 4px rgba(8, 73, 47, 0.06), 0 16px 40px -16px rgba(8, 73, 47, 0.28)",
        glow: "0 0 0 4px rgba(14, 124, 91, 0.15)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        pulsedot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease both",
        pulsedot: "pulsedot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
