import Head from 'next/head'
import ChartStage from '@/components/ChartStage'
import Departures from '@/components/Departures'
import Faq from '@/components/Faq'
import Instruments from '@/components/Instruments'
import Intro from '@/components/Intro'
import Logbook from '@/components/Logbook'
import PortCall from '@/components/PortCall'
import Reveal from '@/components/Reveal'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import Ticker from '@/components/Ticker'
import Transmit from '@/components/Transmit'
import VoyageList from '@/components/VoyageList'
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
        <meta name="theme-color" content="#0a1320" />
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

      <Intro />
      <SiteHeader />

      <Reveal>
        <main id="main" tabIndex={-1}>
          <ChartStage />
          <Ticker />
          <VoyageList />
          <Instruments />
          <Departures />
          <PortCall />
          <Logbook />
          <Faq />
          <Transmit />
        </main>
        <SiteFooter />
      </Reveal>
    </>
  )
}
