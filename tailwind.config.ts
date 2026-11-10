import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#F59E0B",
          "gold-light": "#FBBF24",
          "gold-dark": "#D97706",
          dark: "#0B0D13",
          card: "#11141D",
          border: "#1E2330",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-dancing)", "cursive", "Georgia", "serif"],
        mono: ["var(--font-fira)", "Consolas", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;