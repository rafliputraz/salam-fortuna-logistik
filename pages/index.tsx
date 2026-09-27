import Head from 'next/head'
import Agency from '@/components/Agency'
import Contact from '@/components/Contact'
import Faq from '@/components/Faq'
import Hero from '@/components/Hero'
import Network from '@/components/Network'
import Process from '@/components/Process'
import Reveal from '@/components/Reveal'
import Services from '@/components/Services'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import Standards from '@/components/Standards'
import Statement from '@/components/Statement'
import { COMPANY } from '@/lib/company'

const TITLE = `${COMPANY.legalName} | Freight forwarding & ship agency, ${COMPANY.basePort.city}`
const DESCRIPTION =
  'Freight forwarding and ship agency out of Panjang Port, Bandar Lampung. Sea freight, customs clearance, inland trucking, and full husbandry, handled by one team.'

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fcfcfd" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/favicon-96x96.png" />
      </Head>

      <a
        href="#main"
        className="btn-signal sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80]"
      >
        Skip to content
      </a>

      <SiteHeader />

      <Reveal>
        <main id="main" tabIndex={-1}>
          <Hero />
          <Statement />
          <Services />
          <Process />
          <Network />
          <Agency />
          <Standards />
          <Faq />
          <Contact />
        </main>
        <SiteFooter />
      </Reveal>
    </>
  )
}
