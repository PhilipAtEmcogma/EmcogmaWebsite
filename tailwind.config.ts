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
        // Cyberpunk 2077 color palette
        cyber: {
          dark: '#0e0e10',        // Deeper background (Night City darkness)
          darker: '#050506',      // Absolute black
          light: '#1c1c24',       // Card backgrounds
          primary: '#fce700',     // Iconic CP2077 yellow
          secondary: '#ff003c',   // Deep red/magenta
          accent: '#00f0ff',      // Cyan highlight
          purple: '#b820e6',      // Deep purple
          pink: '#ff0084',        // Hot pink
          blue: '#0047ff',        // Deep blue
          yellow: '#fce700',      // Primary yellow
          orange: '#ff6f00',      // Warning orange
          grid: '#1a1a22',        // Grid lines
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-rajdhani)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-share-tech)', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(0deg, transparent 24%, rgba(252, 231, 0, .03) 25%, rgba(252, 231, 0, .03) 26%, transparent 27%, transparent 74%, rgba(252, 231, 0, .03) 75%, rgba(252, 231, 0, .03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(252, 231, 0, .03) 25%, rgba(252, 231, 0, .03) 26%, transparent 27%, transparent 74%, rgba(252, 231, 0, .03) 75%, rgba(252, 231, 0, .03) 76%, transparent 77%, transparent)',
        'gradient-yellow': 'linear-gradient(135deg, #fce700 0%, #ff6f00 100%)',
        'gradient-cp2077': 'linear-gradient(135deg, #fce700 0%, #ff003c 50%, #0047ff 100%)',
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-yellow': 'glowYellow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'glitch': 'glitch 0.5s cubic-bezier(.25, .46, .45, .94) both infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(252, 231, 0, 0.3), 0 0 10px rgba(252, 231, 0, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(252, 231, 0, 0.5), 0 0 20px rgba(252, 231, 0, 0.4), 0 0 30px rgba(252, 231, 0, 0.2)' },
        },
        glowYellow: {
          '0%': { boxShadow: '0 0 5px rgba(252, 231, 0, 0.4), 0 0 10px rgba(252, 231, 0, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(252, 231, 0, 0.6), 0 0 25px rgba(252, 231, 0, 0.5), 0 0 35px rgba(255, 111, 0, 0.3)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '41.99%': { opacity: '1' },
          '42%': { opacity: '0' },
          '43%': { opacity: '0' },
          '43.01%': { opacity: '1' },
          '47.99%': { opacity: '1' },
          '48%': { opacity: '0' },
          '49%': { opacity: '0' },
          '49.01%': { opacity: '1' },
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
