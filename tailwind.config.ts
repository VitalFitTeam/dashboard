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
        // Tus colores personalizados del sistema de diseño
        primary: "#F27F2A", // Naranja Vital
        complementary: {
          black: "#1A1A1A", // Negro Carbón
          darkGray: "#5C5E60", // Gris Oscuro
          white: "#FFFFFF", // Blanco Puro
        },
        accents: {
          red: "#EA232D", // Rojo Intenso
          green: "#42672D", // Verde Vital
        },
        // Mantén los existentes de Next.js (opcional)
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        heading: ["var(--font-bebas)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
