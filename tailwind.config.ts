import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f4",
          100: "#dceee6",
          200: "#bce0cf",
          300: "#8fcab0",
          400: "#5eab8c",
          500: "#3d8f70",
          600: "#2e7359",
          700: "#265c49",
          800: "#214a3c",
          900: "#1c3d33",
          950: "#0f221c",
        },
        earth: {
          50: "#f7f5f0",
          100: "#ece7db",
          200: "#d9cfb8",
          300: "#c2b08f",
          400: "#ae9470",
          500: "#9f8160",
          600: "#8a6a51",
          700: "#705443",
          800: "#5d463a",
          900: "#4d3b32",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
