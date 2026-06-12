import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent — sage green, anchored on StoryGecko's VirtualAudience
        // card color (#7aa483 == amber-500). Kept under the `amber-*` class
        // names the app already uses so the whole UI recolors from one place;
        // despite the name, these are greens.
        amber: {
          100: "#e3efe6",
          200: "#c7dfcd",
          300: "#aacfb4",
          400: "#93c0a0",
          500: "#7aa483",
          600: "#5e8568",
          700: "#4e6f56",
          800: "#3a5341",
          900: "#2a3d30",
        },
        neutral: {
          900: "#0a0a0a",
          800: "#171717",
          700: "#262626",
          600: "#404040",
          500: "#737373",
          400: "#a3a3a3",
          300: "#d4d4d4",
          200: "#e5e5e5",
          100: "#f5f5f5",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
