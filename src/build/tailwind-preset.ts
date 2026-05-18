import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/** Use in host `appspresso.config.ts` as `presets: [appspressoTailwindPreset]`. */
export const appspressoTailwindPreset: Partial<Config> = {
  darkMode: ["class"],
  theme: {
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        /** Full stack `--font-sans` in `index.css`; see `appspresso/theme/fonts` */
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "appspresso-gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "progress-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
      animation: {
        "appspresso-gradient-pan":
          "appspresso-gradient-pan 14s ease-in-out infinite",
        "progress-indeterminate":
          "progress-indeterminate 1.35s ease-in-out infinite",
      },
      backgroundImage: {
        "appspresso-gradient-brand":
          "linear-gradient(135deg, hsl(var(--primary) / 0.94) 0%, hsl(var(--accent)) 55%, hsl(var(--primary) / 0.88) 100%)",
        "appspresso-gradient-brand-soft":
          "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.2) 50%, hsl(var(--muted) / 0.35) 100%)",
        "appspresso-gradient-muted-wash":
          "linear-gradient(180deg, hsl(var(--muted) / 0.45) 0%, hsl(var(--background)) 65%)",
        "appspresso-gradient-text":
          "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--foreground) / 0.92) 45%, hsl(var(--muted-foreground)) 100%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
