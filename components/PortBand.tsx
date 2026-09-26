import { PORTS } from '@/lib/company'

/**
 * The gateways we move cargo through, running as a band. Name in display caps
 * with its UN/LOCODE set beneath in mono — the way a port is actually written
 * on a booking.
 */
export default function PortBand() {
  const run = [...PORTS, ...PORTS]

  return (
    <section
      aria-label="Ports served"
      className="border-y border-line bg-surface-sunken py-8"
    >
      <p className="shell t-data mb-6 flex items-center gap-3 text-ink-soft">
        <span className="h-1.5 w-1.5 bg-brand" />
        Gateways we work
      </p>

      <div className="mask-fade-x overflow-hidden">
        <ul className="ticker-track flex w-max items-end">
          {run.map((port, i) => (
            <li
              key={`${port.code}-${i}`}
              className="flex shrink-0 items-end"
              aria-hidden={i >= PORTS.length}
            >
              <span className="t-display-sm text-[1.4rem] text-ink md:text-[1.85rem]">
                {port.name}
              </span>
              <span className="t-data ml-3 pb-1 text-brand-600">{port.code}</span>
              <span className="mx-7 mb-2 h-1.5 w-1.5 rotate-45 bg-line-strong md:mx-10" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
