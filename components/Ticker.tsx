import { COMPANY, SERVICES } from '@/lib/company'

const ITEMS = [
  `${COMPANY.basePort.code} ${COMPANY.basePort.coords}`,
  ...SERVICES.map((s) => s.title),
  COMPANY.hours.port,
]

/** A navtex strip: the one marquee on the page, running under the chart. */
export default function Ticker() {
  const run = [...ITEMS, ...ITEMS]
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-line bg-signal py-3 text-paper">
      <div className="marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {run.map((t, i) => (
              <span key={`${k}-${i}`} className="t-label flex items-center gap-6 whitespace-nowrap pr-6 text-[0.8rem]">
                {t}
                <svg viewBox="0 0 10 10" className="h-2 w-2 fill-current">
                  <path d="M5 0 L10 5 L5 10 L0 5 Z" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
