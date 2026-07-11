import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef3ff",
          100: "#e0e9ff",
          200: "#c7d6fe",
          300: "#a4b9fc",
          400: "#7d95f8",
          500: "#5a6ff0",
          600: "#4049e3",
          700: "#3538c7",
          800: "#2d31a1",
          900: "#292f80",
          950: "#1a1c4d",
        },
      },
      backgroundImage: {
        "grid-slate":
          "linear-gradient(to right, rgb(15 23 42 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 12px -2px rgb(15 23 42 / 0.06)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 8px 24px -8px rgb(15 23 42 / 0.10)",
        "card-hover": "0 2px 6px 0 rgb(15 23 42 / 0.08), 0 12px 32px -8px rgb(15 23 42 / 0.14)",
        glow: "0 0 0 1px rgb(90 111 240 / 0.16), 0 8px 24px -6px rgb(90 111 240 / 0.35)",
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
