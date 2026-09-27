/** @type {import('tailwindcss').Config} */
const token = (name) => `oklch(var(--c-${name}) / <alpha-value>)`

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // Every colour resolves to a token in styles/tokens.css.
      colors: {
        paper: { DEFAULT: token('paper'), 2: token('paper-2'), 3: token('paper-3') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        ink: { DEFAULT: token('ink'), 2: token('ink-2'), 3: token('ink-3') },
        deep: { DEFAULT: token('deep'), 2: token('deep-2') },
        signal: { DEFAULT: token('signal'), deep: token('signal-deep') },
        sky: token('sky'),
        go: token('go'),
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      maxWidth: {
        shell: '84rem',
      },
    },
  },
  plugins: [],
}
