import Image from 'next/image'
import { COMPANY, NAV } from '@/lib/company'

/** Dark, to close the page off the way the masthead opens it. */
export default function SiteFooter() {
  return (
    <footer className="on-dark bg-deep py-14 text-paper">
      <div className="shell">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3.5">
              <Image
                src="/images/logo-sfl-nobg.png"
                alt=""
                width={120}
                height={40}
                className="h-9 w-auto"
              />
              <span className="t-display-sm text-[0.95rem]">{COMPANY.legalName}</span>
            </div>
            <p className="t-data mt-5 text-paper/60">{COMPANY.tagline}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="navlink text-paper/60 hover:text-paper"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="t-data mt-12 flex flex-col gap-3 border-t border-deep-line pt-7 text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          <p>{COMPANY.basePort.code} · 05°28′S 105°19′E</p>
        </div>
      </div>
    </footer>
  )
}
