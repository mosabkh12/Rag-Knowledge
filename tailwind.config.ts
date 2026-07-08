import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bcd0fe",
          300: "#8eaffb",
          400: "#5a84f7",
          500: "#3660ef",
          600: "#2545e3",
          700: "#2036c7",
          800: "#212fa1",
          900: "#202b7f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
