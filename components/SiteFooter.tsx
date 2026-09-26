import Image from 'next/image'
import { COMPANY, NAV } from '@/lib/company'

/**
 * A statement footer: the name set across the full width, cut by the foot
 * of the page like a hull by the waterline.
 */
export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-abyss pt-20">
      <div className="shell">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/images/logo-sfl-nobg.png" alt="" width={120} height={40} className="h-10 w-auto" />
            <div>
              <p className="t-head text-xl text-foam">{COMPANY.legalName}</p>
              <p className="mt-1 text-sm text-steel">{COMPANY.tagline}</p>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="navlink">
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-rule pt-6 text-sm text-fog sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p className="t-label">
            {COMPANY.basePort.code} {COMPANY.basePort.coords}
          </p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="t-display mt-10 select-none whitespace-nowrap text-center text-[19.5vw] leading-[0.74] text-hold"
        style={{ marginBottom: '-0.12em' }}
      >
        Salam Fortuna
      </p>
    </footer>
  )
}
