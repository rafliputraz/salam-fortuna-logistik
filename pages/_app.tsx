import type { AppProps } from 'next/app'
import { Bricolage_Grotesque, Martian_Mono, Onest } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import '@/styles/globals.css'

// Display: a chunky grotesk with character, like stencilled lettering on
// painted steel. Its optical-size axis keeps huge headlines tight.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  display: 'swap',
})

// Body: a friendly, very legible grotesk.
const body = Onest({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

// Data: container codes, port codes, labels.
const mono = Martian_Mono({
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
