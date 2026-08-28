import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-raleway)", "Raleway", "sans-serif"],
        body: ["var(--font-arimo)", "Arimo", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        dark: {
          bg: "#000000",
          card: "#0d0d0d",
          cardHover: "#141414",
          surface: "#191919",
          border: "#262626",
          borderLight: "#333333",
          muted: "#888888",
          text: "#f0f0f0",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        accent: {
          red: "#e63946",
          gold: "#f59e0b",
          green: "#10b981",
          blue: "#3b82f6",
        },
      },
      keyframes: {
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "laser-scan": {
          "0%, 100%": { top: "5%" },
          "50%": { top: "90%" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "mouse-scroll": {
          "0%": { opacity: "1", top: "29%" },
          "15%": { opacity: "1", top: "50%" },
          "50%": { opacity: "0", top: "50%" },
          "100%": { opacity: "0", top: "29%" },
        },
      },
      animation: {
        "shimmer": "shimmer 1.8s infinite",
        "laser-scan": "laser-scan 2.5s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "mouse-scroll": "mouse-scroll 2s ease infinite",
      },
    },
  },
  plugins: [],
}

export default config


