import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
          DEFAULT: "#CC2200",
          foreground: "#FFFFFF",
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

        sidebar: {
          sidebarBackground: "hsl(var(--sidebar-background))",
          sidebarForeground: "hsl(var(--sidebar-foreground))",
          sidebarPrimary: "hsl(var(--sidebar-primary))",
          sidebarPrimaryForeground: "hsl(var(--sidebar-primary-foreground))",
          sidebarAccent: "hsl(var(--sidebar-accent))",
          sidebarAccentForeground: "hsl(var(--sidebar-accent-foreground))",
          sidebarBorder: "hsl(var(--sidebar-border))",
          sidebarRing: "hsl(var(--sidebar-ring))",
        },

        // 🔥🔥 EXPLORER COLORS: PLANET ONE BLUE
        explorer: {
          primary: "#0066FF",
          secondary: "#0055CC",
          dark: "#000000",
          light: "#F7F9FC",
          accent: "#00C2FF",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        sans: ["Inter var", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
        heading: ["Syncopate", "system-ui", "sans-serif"],
        tech: ["Orbitron", "system-ui", "sans-serif"],
      },

      // 🔥 Sombras convertidas
      boxShadow: {
        "glow-sm": "0 0 10px -1px rgba(0, 102, 255, 0.2)",
        "glow-md": "0 0 20px -1px rgba(0, 102, 255, 0.3)",
        "glow-lg": "0 0 30px -1px rgba(0, 102, 255, 0.4)",
        brutalist: "4px 4px 0px 0px hsl(var(--primary))",
        "card-hover": "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-light": "pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "bounce-light": "bounce-light 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        in: "in 0.2s ease-out",
        glow: "pulse-glow 2s infinite",
        "text-glow": "text-glow 2s infinite",
      },

      // 🔥 ANIMAÇÕES AGORA VERDE AMAZÔNIA
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-light": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-in": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bounce-light": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },

        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        in: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        // 🔥 Glow antes vermelho → AGORA AZUL COSMO
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0, 102, 255, 0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(0, 102, 255, 0.7)" },
        },
        "text-glow": {
          "0%, 100%": { textShadow: "0 0 10px rgba(0, 102, 255, 0.4)" },
          "50%": { textShadow: "0 0 20px rgba(0, 102, 255, 0.7)" },
        },
      },

      // 🔥 GRADIENTES E CYBER-GRID – AZUL
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        shimmer:
          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,102,255,0.1) 50%, rgba(255,255,255,0) 100%)",

        "cyber-grid":
          "linear-gradient(rgba(0,102,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.05) 1px, transparent 1px)",
      },

      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "bounce-out": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      backdropBlur: {
        xs: "2px",
      },

      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: "hsl(var(--foreground))",
            "h1,h2,h3,h4": {
              color: "hsl(var(--foreground))",
              fontWeight: "700",
            },
            a: {
              color: "hsl(var(--primary))",
              "&:hover": {
                color: "hsl(var(--primary))",
              },
            },
            strong: {
              color: "hsl(var(--foreground))",
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
