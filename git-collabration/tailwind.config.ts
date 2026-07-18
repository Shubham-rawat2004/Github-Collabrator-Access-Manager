import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07111f",
          900: "#0b1627",
          800: "#10213a",
          700: "#17304f"
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(16,185,129,0.14), 0 20px 60px rgba(7,17,31,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
