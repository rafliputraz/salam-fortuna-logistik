import type { AppProps } from 'next/app'
import { Big_Shoulders_Display, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import '@/styles/globals.css'

// Display: Big Shoulders comes out of Chicago's industrial signage. Tall,
// condensed, stencil-straight: the lettering on a hull or a terminal gate.
const display = Big_Shoulders_Display({
  subsets: ['latin'],
  weight: ['600', '800', '900'],
  display: 'swap',
})

// Body: a quiet grotesk that holds up at 15px on a dark ground.
const body = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  // next/font ships no metric overrides for this face yet.
  adjustFontFallback: false,
})

// Data: port codes, references, times.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* The variables land on :root so Tailwind's preflight on `html`
          resolves them, not just elements inside a wrapper. */}
      <style jsx global>{`
        :root {
          --font-display: ${display.style.fontFamily};
          --font-body: ${body.style.fontFamily};
          --font-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <SmoothScroll />
      <Component {...pageProps} />
    </>
  )
}
