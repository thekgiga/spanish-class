/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        // PREMIUM DARK LUXURY PALETTE
        obsidian: {
          DEFAULT: "#0A0A0A",
          50: "#1A1A1A",
          100: "#0F0F0F",
          900: "#000000",
        },
        charcoal: {
          DEFAULT: "#1C1917",
          50: "#F5F5F4",
          100: "#E7E5E4",
          200: "#D6D3D1",
          300: "#A8A29E",
          400: "#78716C",
          500: "#57534E",
          600: "#44403C",
          700: "#292524",
          800: "#1C1917",
          900: "#0C0A09",
        },
        luxury: {
          gold: {
            DEFAULT: "#CA8A04",
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#F59E0B",
            600: "#D97706",
            700: "#CA8A04",
            800: "#92400E",
            900: "#78350F",
          },
          purple: {
            DEFAULT: "#8B5CF6",
            400: "#A78BFA",
            500: "#8B5CF6",
            600: "#7C3AED",
          },
          cyan: {
            DEFAULT: "#0EA5E9",
            400: "#22D3EE",
            500: "#0EA5E9",
            600: "#0284C7",
          },
          emerald: {
            DEFAULT: "#10B981",
            400: "#34D399",
            500: "#10B981",
            600: "#059669",
          },
        },
        // UNIFIED WARM PALETTE - Primary Design System
        "spanish-red": {
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#DC2626",
          600: "#B91C1C",
          700: "#991B1B",
          800: "#7F1D1D",
          900: "#450A0A",
        },
        // Clay - Warm Neutral Palette
        clay: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
        // Keep spanish namespace for backwards compatibility
        spanish: {
          red: {
            50: "#FFF1F2",
            100: "#FFE4E6",
            200: "#FECDD3",
            300: "#FDA4AF",
            400: "#FB7185",
            500: "#DC2626",
            600: "#B91C1C",
            700: "#991B1B",
            800: "#7F1D1D",
            900: "#450A0A",
          },
          gold: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#D97706",
            600: "#B45309",
            700: "#92400E",
            800: "#78350F",
            900: "#451A03",
          },
          terracotta: {
            50: "#FDF4F3",
            100: "#FCE8E6",
            200: "#F9D5D1",
            300: "#F4B5AC",
            400: "#EC8B7D",
            500: "#DC6B56",
            600: "#C84D3A",
            700: "#A83E2E",
            800: "#8B352A",
            900: "#743128",
          },
          olive: {
            50: "#F7F8F3",
            100: "#EEF0E5",
            200: "#DCE0CB",
            300: "#C3CAA6",
            400: "#A7B07F",
            500: "#8B9660",
            600: "#6D764A",
            700: "#555C3C",
            800: "#464B34",
            900: "#3C402E",
          },
          cream: {
            50: "#FFFDFB",
            100: "#FEF9F3",
            200: "#FDF3E7",
            300: "#FAEBD7",
            400: "#F5DFC4",
            500: "#EBCFAA",
            600: "#D4B48E",
            700: "#B8946E",
            800: "#9A7654",
            900: "#7D5E42",
          },
        },
        // Keep compatibility with existing code
        navy: {
          50: "#F8F9FC",
          100: "#EEF1F6",
          200: "#DDE3ED",
          300: "#B4BECD",
          400: "#8B99AD",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },

        // ========================================
        // PREMIUM EDUCATION COLOR SYSTEM
        // ========================================
        // NEW PRIMARY PALETTE - Use these for all new development
        // Replaces spanish-red/gold/clay with professional education colors

        // Primary Brand Color - Trust Blue
        "edu-blue": {
          50: "#EFF6FF", // Lightest backgrounds
          100: "#DBEAFE", // Light backgrounds
          200: "#BFDBFE", // Subtle accents
          300: "#93C5FD", // Hover states (light)
          400: "#60A5FA", // Active states
          500: "#3B82F6", // Secondary brand
          600: "#2563EB", // PRIMARY BRAND COLOR - Main buttons, active nav
          700: "#1D4ED8", // Hover states (dark)
          800: "#1E40AF", // Dark accents
          900: "#1E3A8A", // Darkest text
          950: "#172554", // Ultra dark
        },

        // Success & Progress Color - Emerald Green
        "edu-emerald": {
          50: "#ECFDF5", // Lightest backgrounds
          100: "#D1FAE5", // Light backgrounds
          200: "#A7F3D0", // Subtle accents
          300: "#6EE7B7", // Hover states
          400: "#34D399", // Active states
          500: "#10B981", // PRIMARY SUCCESS COLOR - Progress bars, completion
          600: "#059669", // Hover states (dark)
          700: "#047857", // Dark accents
          800: "#065F46", // Darkest
          900: "#064E3B", // Ultra dark
        },

        // High-Priority CTA Color - Orange
        "edu-orange": {
          50: "#FFF7ED", // Lightest backgrounds
          100: "#FFEDD5", // Light backgrounds
          200: "#FED7AA", // Subtle accents
          300: "#FDBA74", // Hover states
          400: "#FB923C", // Active states
          500: "#F97316", // PRIMARY CTA COLOR - High-priority CTAs
          600: "#EA580C", // PRIMARY CTA HOVER
          700: "#C2410C", // Dark accents
          800: "#9A3412", // Darkest
          900: "#7C2D12", // Ultra dark
        },

        // Neutral & Text Color - Slate
        "edu-slate": {
          50: "#F8FAFC", // Lightest backgrounds
          100: "#F1F5F9", // Light backgrounds
          200: "#E2E8F0", // Borders
          300: "#CBD5E1", // Subtle borders
          400: "#94A3B8", // Muted text
          500: "#64748B", // Secondary text
          600: "#475569", // Body text (light mode)
          700: "#334155", // Headings
          800: "#1E293B", // PRIMARY BODY TEXT (12.6:1 contrast)
          900: "#0F172A", // Darkest text
          950: "#020617", // Ultra dark
        },

        // Accent Colors (optional, for specific use cases)
        "edu-amber": {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // WARNING/PENDING COLOR
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },

        "edu-red": {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444", // ERROR COLOR ONLY
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },

        // ========================================
        // EARTHY SPANISH PALETTE - New Warm & Professional Design
        // ========================================
        "spanish-teal": {
          50: "#F0F5F5",
          100: "#D9E6E6",
          200: "#B3CCCD",
          300: "#8CB3B4",
          400: "#66999B",
          500: "#2F5559", // PRIMARY DARK TEAL (from palette)
          600: "#264447",
          700: "#1D3335",
          800: "#132223",
          900: "#0A1112",
        },
        "spanish-coral": {
          50: "#FCF5F3",
          100: "#F7E4DD",
          200: "#EFC9BC",
          300: "#E6AE9A",
          400: "#DE9379",
          500: "#B8684E", // PRIMARY TERRACOTTA (from palette)
          600: "#93533E",
          700: "#6E3E2F",
          800: "#4A2A1F",
          900: "#251510",
        },
        "spanish-sunshine": {
          50: "#FBF9F2",
          100: "#F5EFDB",
          200: "#EBE0B7",
          300: "#E1D093",
          400: "#D7C06F",
          500: "#D4A556", // PRIMARY GOLDEN (from palette)
          600: "#AA8445",
          700: "#7F6334",
          800: "#554222",
          900: "#2A2111",
        },
        "spanish-orange": {
          50: "#F9F4F1",
          100: "#F0E3DA",
          200: "#E1C7B5",
          300: "#D2AB90",
          400: "#C38F6B",
          500: "#C17A5C", // PRIMARY BURNT ORANGE (from palette)
          600: "#9A624A",
          700: "#744937",
          800: "#4D3125",
          900: "#271812",
        },
        "spanish-olive": {
          50: "#F6F7F3",
          100: "#E9EBDE",
          200: "#D3D7BD",
          300: "#BDC39C",
          400: "#A7AF7B",
          500: "#7A8558", // PRIMARY OLIVE (from palette)
          600: "#626A46",
          700: "#495035",
          800: "#313523",
          900: "#181B12",
        },
        "spanish-cream": {
          50: "#FDFCFB",
          100: "#F9F6F2",
          200: "#F3EDE5",
          300: "#EDE4D8",
          400: "#E7DBCB",
          500: "#E8D5BE", // PRIMARY CREAM (from palette)
          600: "#BAAA98",
          700: "#8B8072",
          800: "#5D554C",
          900: "#2E2A26",
        },

        // ========================================
        // DEPRECATED COLORS - Will be removed after migration
        // ========================================
        // DO NOT USE THESE IN NEW CODE
        // Use edu-blue, edu-emerald, edu-orange, edu-slate instead
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",

        // ========================================
        // PREMIUM EDUCATION GRADIENTS
        // ========================================

        // Primary brand gradient (dark teal to olive)
        "gradient-blue": "linear-gradient(135deg, #2F5559 0%, #7A8558 100%)",

        // Success gradient (olive to golden)
        "gradient-emerald": "linear-gradient(135deg, #7A8558 0%, #D4A556 100%)",

        // CTA gradient (terracotta to burnt orange)
        "gradient-orange": "linear-gradient(135deg, #B8684E 0%, #C17A5C 100%)",

        // Page background gradient (cream to soft teal)
        "gradient-page":
          "linear-gradient(135deg, #FDFCFB 0%, #F0F5F5 50%, #F6F7F3 100%)",

        // Hero section gradient (teal to golden)
        "gradient-hero": "linear-gradient(135deg, #2F5559 0%, #D4A556 100%)",

        // ========================================
        // DEPRECATED GRADIENTS - Will be removed after migration
        // ========================================

        "gradient-spanish": "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)", // DEPRECATED: Use gradient-blue
        "gradient-gold": "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", // DEPRECATED: Use gradient-emerald
        "gradient-warm": "linear-gradient(135deg, #FEF3C7 0%, #FDF4F3 100%)", // DEPRECATED: Use gradient-page
        "gradient-sidebar": "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
        "mesh-pattern": `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B91C1C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
      boxShadow: {
        // ========================================
        // PREMIUM EDUCATION SHADOWS
        // ========================================

        // Standard elevation shadows (blue-tinted for premium feel)
        soft: "0 2px 8px -2px rgba(37, 99, 235, 0.1), 0 4px 16px -4px rgba(37, 99, 235, 0.05)",
        medium:
          "0 4px 12px -2px rgba(37, 99, 235, 0.15), 0 8px 24px -4px rgba(37, 99, 235, 0.1)",
        large:
          "0 8px 24px -4px rgba(37, 99, 235, 0.2), 0 16px 48px -8px rgba(37, 99, 235, 0.15)",

        // Brand glow shadows - Earthy palette
        "glow-blue": "0 8px 24px rgba(47, 85, 89, 0.25)", // Dark teal
        "glow-emerald": "0 8px 24px rgba(122, 133, 88, 0.25)", // Olive
        "glow-orange": "0 8px 24px rgba(212, 165, 86, 0.25)", // Golden
        "glow-terracotta": "0 8px 24px rgba(184, 104, 78, 0.25)",
        "glow-cream": "0 8px 24px rgba(232, 213, 190, 0.15)",

        // Utility shadows
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",

        // ========================================
        // EXISTING SHADOWS (Keep for compatibility)
        // ========================================

        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
        "elevation-sm": "0 2px 8px rgba(0, 0, 0, 0.1)",
        "elevation-md": "0 8px 24px rgba(0, 0, 0, 0.15)",
        "elevation-lg": "0 16px 48px rgba(0, 0, 0, 0.2)",
        "elevation-xl": "0 24px 64px rgba(0, 0, 0, 0.3)",

        // ========================================
        // DEPRECATED SHADOWS - Will be removed after migration
        // ========================================

        "glow-red": "0 0 20px rgba(185, 28, 28, 0.3)", // DEPRECATED: Use glow-blue
        "glow-gold": "0 0 20px rgba(245, 158, 11, 0.3)", // DEPRECATED: Use glow-emerald
        "gold-glow": "0 8px 32px rgba(251, 191, 36, 0.4)", // DEPRECATED: Use glow-emerald
        "purple-glow": "0 8px 32px rgba(139, 92, 246, 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // PREMIUM LIQUID GLASS ANIMATIONS
        "gradient-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "pulse-soft": "pulse-soft 2s infinite ease-in-out",
        // PREMIUM LIQUID GLASS ANIMATIONS
        "gradient-flow": "gradient-flow 8s ease infinite",
        morph: "morph 10s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
