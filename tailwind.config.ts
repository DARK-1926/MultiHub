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
        "brand-orange": "#FF4D00",
        ink: "#FFFFFF",      // Pure crisp white text and accents on black theme
        paper: "#000000",    // Pitch black canvas
        surface: "#0A0A0A",  // Subtle deep dark card surface
        panel: "#121212",    // Contrast panel background
        borderline: "#2A2A2A", // 2px brutalist dark-mode border
      },
      fontFamily: {
        archivo: ["var(--font-archivo-black)", "sans-serif"],
        space: ["var(--font-space-mono)", "monospace"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
        "spin-slow": "spin-slow 12s linear infinite",
      },
      boxShadow: {
        "nav-depth": "0 10px 30px -5px rgba(255, 77, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
