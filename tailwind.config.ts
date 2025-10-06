import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
