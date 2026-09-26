import type { AppProps } from 'next/app'
import { Archivo, Barlow, IBM_Plex_Mono } from 'next/font/google'
import '@/styles/globals.css'

// Display: Archivo carries a width axis, so headlines can be pushed wide the
// way lettering is stencilled across a hull.
const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'], // variable font: weight and width are both animatable in CSS
  variable: '--font-display',
  display: 'swap',
})

// Body: Barlow comes out of public transport signage — the right register for
// a company whose work is moving things down a road and across water.
const body = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

// Data: port codes, timings, and reference numbers.
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/*
        The variables have to land on :root, not on a wrapper element.
        Tailwind's preflight sets `font-family` on `html` itself, so a variable
        scoped any deeper leaves that declaration unresolved — and an invalid
        font-family falls back to the browser's serif, which then inherits
        down into every element that has no explicit face of its own.
      */}
      <style jsx global>{`
        :root {
          --font-display: ${display.style.fontFamily};
          --font-body: ${body.style.fontFamily};
          --font-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
