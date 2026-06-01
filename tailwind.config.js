export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        slate: {
          950: '#0b0b0d',
        },
        gold: '#d6b94d',
        glow: '#d6b94d',
      },
      boxShadow: {
        neon: '0 0 30px rgba(214, 185, 77, 0.18)',
      },
    },
  },
  plugins: [],
};
