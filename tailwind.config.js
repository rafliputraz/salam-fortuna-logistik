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
        abyss: token('abyss'),
        hull: token('hull'),
        hold: token('hold'),
        rule: {
          DEFAULT: token('rule'),
          strong: token('rule-strong'),
        },
        foam: token('foam'),
        steel: token('steel'),
        fog: token('fog'),
        signal: {
          DEFAULT: token('signal'),
          deep: token('signal-deep'),
          lift: token('signal-lift'),
        },
        go: token('go'),
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      maxWidth: {
        shell: '88rem',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },
    },
  },
  plugins: [],
}
