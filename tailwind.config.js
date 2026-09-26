/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Page grounds. Chart white with a marine cast — cool, not cream.
        surface: {
          DEFAULT: '#f4f7f7',
          raised: '#ffffff',
          sunken: '#e7eef0',
        },
        line: {
          DEFAULT: '#d3dee0',
          strong: '#b1c1c4',
        },
        // Type on light grounds.
        ink: {
          DEFAULT: '#072027',
          soft: '#4c666e',
        },
        // The two dark grounds: the husbandry section and the footer. Kept
        // deliberately few — they are punctuation, not the page.
        deep: {
          DEFAULT: '#062027',
          1: '#0b2c35',
          line: '#1b4553',
        },
        oxblood: '#280709',
        paper: '#f2efe8', // type on dark grounds
        // Brand red, sampled from the SFL mark. Identity + action only.
        // 600 for small type and buttons — pure #e11b22 only clears ~4:1.
        // 300 for small red type on the dark grounds.
        brand: {
          DEFAULT: '#e11b22',
          600: '#c8151c',
          700: '#9d0f15',
          300: '#ff6a5f',
        },
        // Reserved for "on schedule / cleared" status. 300 is the dark-ground
        // counterpart.
        signal: {
          DEFAULT: '#0d8f6d',
          300: '#5fd3b2',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        shell: '84rem',
      },
    },
  },
  plugins: [],
}
