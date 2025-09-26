import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#040910",
        surface: "#0C1626",
        accent: {
          DEFAULT: "#5C7CFA",
          muted: "#4E5DFF",
          subtle: "#9BA5FF"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
