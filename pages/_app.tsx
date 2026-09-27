import type { AppProps } from 'next/app'
import { Big_Shoulders_Display, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import '@/styles/globals.css'

// Display: condensed, tall, the lettering on a harbour sign or a hull.
const display = Big_Shoulders_Display({
  subsets: ['latin'],
  weight: ['600', '800', '900'],
  display: 'swap',
})

// Body: engineered and plain, like an instrument manual.
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

// Readouts: coordinates, port codes, the time.
const mono = IBM_Plex_Mono({
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
