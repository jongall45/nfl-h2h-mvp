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
        // Nebula theme colors
        nebula: {
          bg: '#0a0a0a',
          card: '#161616',
          border: '#222222',
          text: '#888888',
          muted: '#555555',
          orange: '#ff6b35',
        },
        // Legacy support
        background: "#0a0a0a",
        foreground: "#ffffff",
        "neon-green": "#00FF00",
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "marquee": "marquee var(--duration) linear infinite",
        "spotlight": "spotlight 2s ease .75s 1 forwards",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "fade-slide-up": "fadeSlideUp 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(20px)" },
          to: { transform: "translateY(0)" },
        },
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)" },
          "50%": { opacity: "1", boxShadow: "0 0 40px rgba(0, 255, 0, 0.5)" },
        },
      },
      boxShadow: {
        "glow-green": "0 0 30px rgba(0, 255, 0, 0.3)",
        "glow-green-sm": "0 0 15px rgba(0, 255, 0, 0.3)",
        "glow-green-lg": "0 0 50px rgba(0, 255, 0, 0.4)",
        "glow-orange": "0 0 30px rgba(255, 107, 53, 0.3)",
        "glow-orange-sm": "0 0 15px rgba(255, 107, 53, 0.3)",
        "glow-orange-lg": "0 0 50px rgba(255, 107, 53, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
