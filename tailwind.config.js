/** @type {import('tailwindcss').Config} */
const token = (name) => `oklch(var(--c-${name}) / <alpha-value>)`

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Every colour resolves to a token in styles/tokens.css.
      colors: {
        paper: {
          DEFAULT: token('paper'),
          2: token('paper-2'),
        },
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
        },
        ink: {
          DEFAULT: token('ink'),
          2: token('ink-2'),
          3: token('ink-3'),
        },
        signal: {
          DEFAULT: token('signal'),
          deep: token('signal-deep'),
        },
        box: {
          magenta: token('box-magenta'),
          orange: token('box-orange'),
          cobalt: token('box-cobalt'),
          green: token('box-green'),
          mustard: token('box-mustard'),
          steel: token('box-steel'),
          red: token('box-red'),
        },
        go: token('go'),
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      maxWidth: {
        shell: '90rem',
      },
    },
  },
  plugins: [],
}
