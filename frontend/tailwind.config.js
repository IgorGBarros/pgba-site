/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ========================================
      // FONTES
      // ========================================
      fontFamily: {
        // Fontes originais do site (PG Solutions)
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],

        // ========================================
        // CODEX TURNAROUND - FONTES MEDIEVAIS
        // ========================================
        codex: ["Cinzel", "serif"],
        headline: ["Cinzel", "serif"],
        title: ["Cormorant Garamond", "serif"],
        body: ["EB Garamond", "serif"],
        label: ["Cinzel", "serif"],
      },

      // ========================================
      // CORES
      // ========================================
      colors: {
        // ---- Cores originais (HSL via variáveis CSS) ----
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chat: {
          user: "hsl(var(--chat-user))",
          "user-foreground": "hsl(var(--chat-user-foreground))",
          assistant: "hsl(var(--chat-assistant))",
          "assistant-foreground": "hsl(var(--chat-assistant-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ========================================
        // CODEX TURNAROUND - PALETAS MEDIEVAIS (HEX)
        // Necessário em HEX para que os modificadores
        // de opacidade (/10, /30, etc.) funcionem
        // ========================================

        // Parchment (Pergaminho)
        parchment: {
          50: "#fffdf7",
          100: "#fff8eb",
          200: "#ffead9",
          300: "#ffd9b8",
          400: "#ffc494",
          500: "#f0d5be",
          600: "#d4b896",
          700: "#a88968",
          800: "#7a6347",
          900: "#4a3b2a",
          950: "#2a1f14",
        },

        // Ink (Tinta)
        ink: {
          50: "#f5f1ea",
          100: "#e8dfd0",
          200: "#c9b89a",
          300: "#9c8466",
          400: "#6f5a42",
          500: "#4a3b2a",
          600: "#3a2e1f",
          700: "#2a2015",
          800: "#1a140c",
          900: "#0f0b07",
          950: "#070503",
        },

        // Vermillion (Selo Vermelho)
        vermillion: {
          50: "#fef2f2",
          100: "#fde3e3",
          200: "#fccbcb",
          300: "#f9a4a4",
          400: "#f26d6d",
          500: "#e53e3e",
          600: "#cc2d2d",
          700: "#aa2424",
          800: "#8b1d1d",
          900: "#6b1616",
          950: "#3d0a0a",
        },

        // Gold (Dourado)
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d4a017",
          600: "#b8860b",
          700: "#92700c",
          800: "#6b5209",
          900: "#4a3807",
          950: "#2a1f04",
        },

        // Sage (Sálvia - contratos bons)
        sage: {
          50: "#f4f7f4",
          100: "#e4ebe4",
          200: "#c8d6c8",
          300: "#9fb39f",
          400: "#738c73",
          500: "#557055",
          600: "#415841",
          700: "#354735",
          800: "#2b392b",
          900: "#232f23",
          950: "#131a13",
        },
      },

      // ========================================
      // BORDER RADIUS
      // ========================================
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ========================================
      // KEYFRAMES
      // ========================================
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // CODEX TURNAROUND - Animações medievais
        flicker: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.92", filter: "brightness(1.05)" },
        },
        "seal-press": {
          "0%": { transform: "scale(1.2) rotate(-10deg)" },
          "50%": { transform: "scale(0.9) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "pulse-critical": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },

      // ========================================
      // ANIMATIONS
      // ========================================
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // CODEX TURNAROUND - Animações medievais
        flicker: "flicker 4s ease-in-out infinite",
        "seal-press": "seal-press 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-critical": "pulse-critical 2s infinite",
      },
    },
  },
  plugins: [animate],
};