/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0c10',
        darkCard: '#15171e',
        darkBorder: '#232733',
        neonPurple: '#8b5cf6',
        neonPink: '#ec4899',
        neonCyan: '#06b6d4',
      },
      boxShadow: {
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.35)',
        'glow-pink': '0 0 15px rgba(236, 72, 153, 0.35)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.35)',
      }
    },
  },
  plugins: [],
}
