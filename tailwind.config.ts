import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette
        cyber: {
          dark: '#0a0a0f',
          darker: '#050508',
          light: '#1a1a2e',
          primary: '#00f0ff', // Neon cyan
          secondary: '#ff00ff', // Neon magenta
          accent: '#00ff41', // Matrix green
          purple: '#9d00ff',
          pink: '#ff006e',
          blue: '#0066ff',
          yellow: '#ffff00',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'monospace'],
        sans: ['var(--font-geist-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, .05) 25%, rgba(0, 240, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, .05) 75%, rgba(0, 240, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, .05) 25%, rgba(0, 240, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, .05) 75%, rgba(0, 240, 255, .05) 76%, transparent 77%, transparent)',
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2), 0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.4), 0 0 20px rgba(0, 240, 255, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
