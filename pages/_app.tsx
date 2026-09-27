import type { AppProps } from 'next/app'
import { Plus_Jakarta_Sans } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import '@/styles/globals.css'

// One family for everything: a geometric sans drawn in Jakarta, with the
// weight range to carry both headlines and small print.
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* The variables land on :root so Tailwind's preflight on `html`
          resolves them, not just elements inside a wrapper. */}
      <style jsx global>{`
        :root {
          --font-sans: ${sans.style.fontFamily};
        }
      `}</style>
      <SmoothScroll />
      <Component {...pageProps} />
    </>
  )
}
