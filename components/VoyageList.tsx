import { VOYAGE } from '@/lib/company'
import { LEG_ICONS } from './icons'

/**
 * The five legs as a plain log, for screens too narrow to pin the chart.
 * Wide screens get the same content inside the chart itself.
 */
export default function VoyageList() {
  return (
    <section id="voyage" aria-labelledby="voyage-heading" className="chart-grid border-t border-line py-20 lg:hidden">
      <div className="shell">
        <p className="t-label text-cyan">How it moves</p>
        <h2 id="voyage-heading" data-split className="t-display mt-4 text-[length:var(--text-display-s)] text-ink">
          One file, gate to gate.
        </h2>
        <ol className="relative mt-12 space-y-10 border-l border-dashed border-route/60 pl-8">
          {VOYAGE.map((leg, i) => {
            const Icon = LEG_ICONS[leg.code]
            return (
              <li key={leg.code} data-reveal className="relative">
                <span className="absolute -left-[2.55rem] top-0 flex h-8 w-8 items-center justify-center border border-signal/60 bg-paper text-signal">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="t-label text-ink-3">
                  WPT {String(i + 1).padStart(2, '0')} · {leg.code}
                </p>
                <h3 className="t-head mt-2 text-[2.2rem] text-ink">{leg.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{leg.body}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {leg.detail.map((d) => (
                    <li key={d} className="t-label border border-cyan/30 px-3 py-1.5 text-cyan">
                      {d}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
