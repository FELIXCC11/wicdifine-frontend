// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      minWidth: {
        '3': '0.75rem',
        '7': '1.75rem'
      },
      borderRadius: {
        'xl': '0.75rem',    // 12px (for inputs)
        '2xl': '1rem',      // 16px (message bubbles)
        '3xl': '1.5rem'     // 24px (optional for larger elements)
      },
      colors: {
        primary: {
          DEFAULT: '#2F80ED',  // Keep WICFIN's blue
          foreground: '#ffffff' // White text for better contrast
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
        }
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      // Add chat-specific shadows
      boxShadow: {
        'message': '0 2px 4px rgba(0,0,0,0.05)',
      }
    }
  },
  plugins: [],
}