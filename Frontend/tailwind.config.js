module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spoon-swing': {
          '0%, 100%': { transform: 'rotate(12deg)' },
          '50%': { transform: 'rotate(-20deg)' },
        },
        'jump': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-24px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 3s linear infinite',
        'spoon-swing': 'spoon-swing 1.2s ease-in-out infinite',
        'jump1': 'jump 1.2s infinite',
        'jump2': 'jump 1.4s 0.2s infinite',
        'jump3': 'jump 1.6s 0.4s infinite',
        'fade-in': 'fade-in 0.8s ease-out',
        'zoom-in': 'zoom-in 0.6s ease-out',
      },
    },
  },
  plugins: [
    import('tailwind-scrollbar'),
  ],
}