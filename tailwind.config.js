/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#090D16',          // Deepest obsidian canvas
          subtle: '#0D1322',      // Slightly elevated card base
          card: '#111827',        // Standard card surface
          cardHover: '#161F33',   // Card hover state
          elevated: '#1A243B',    // Elevated modals / popovers
          active: '#212E4A',      // Pressed / Active items
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          borderHighlight: 'rgba(255, 255, 255, 0.15)',
          text: {
            primary: '#F8FAFC',   // High readability white
            secondary: '#94A3B8', // Muted metadata
            tertiary: '#64748B',  // Dim labels & shortcuts
            accent: '#38BDF8',    // Cyan link & highlights
          },
          cyan: {
            DEFAULT: '#06B6D4',
            light: '#38BDF8',
            glow: 'rgba(6, 182, 212, 0.15)',
            subtle: 'rgba(6, 182, 212, 0.08)',
          },
          emerald: {
            DEFAULT: '#10B981',
            light: '#34D399',
            glow: 'rgba(16, 185, 129, 0.15)',
            subtle: 'rgba(16, 185, 129, 0.08)',
          },
          violet: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            glow: 'rgba(139, 92, 246, 0.15)',
            subtle: 'rgba(139, 92, 246, 0.08)',
          },
          amber: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            glow: 'rgba(245, 158, 11, 0.15)',
            subtle: 'rgba(245, 158, 11, 0.08)',
          },
          rose: {
            DEFAULT: '#F43F5E',
            light: '#FB7185',
            glow: 'rgba(244, 63, 94, 0.15)',
            subtle: 'rgba(244, 63, 94, 0.08)',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
        'card-subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.35), 0 1px 2px -1px rgba(0, 0, 0, 0.35)',
        'panel': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
