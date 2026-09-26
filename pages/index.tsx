import Head from 'next/head'
import Agency from '@/components/Agency'
import Contact from '@/components/Contact'
import CtaBand from '@/components/CtaBand'
import Faq from '@/components/Faq'
import PortBand from '@/components/PortBand'
import Reveal from '@/components/Reveal'
import ShipStory from '@/components/ShipStory'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import Standards from '@/components/Standards'
import Voyage from '@/components/Voyage'
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
        <meta name="theme-color" content="#08121a" />
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

      <div className="grain">
        <SiteHeader />

        <Reveal>
          <main id="main" tabIndex={-1}>
            <ShipStory />
            <PortBand />
            <Voyage />
            <Agency />
            <Standards />
            <Faq />
            <Contact />
            <CtaBand />
          </main>
        </Reveal>

        <SiteFooter />
      </div>
    </>
  )
}
