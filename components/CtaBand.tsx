import { COMPANY, CTA } from '@/lib/company'
import { ArrowRight, Mail, Phone } from './icons'

/**
 * The one section that is brand red end to end, sitting between the form and
 * the dark footer. The form above it is the considered route; this is the
 * direct one, for anyone who would rather just call.
 */
export default function CtaBand() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="on-dark relative overflow-hidden bg-brand text-white"
    >
      <div className="chart-grid-dark absolute inset-0" aria-hidden="true" />

      <div className="shell relative grid gap-12 py-20 md:py-24 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p data-reveal className="eyebrow text-white/70">
            <span>{COMPANY.basePort.code}</span>
            <span>Panjang · Bandar Lampung</span>
          </p>

          <h2
            id="cta-heading"
            data-reveal
            className="t-display mt-7 text-[clamp(1.9rem,4.4vw,3.4rem)]"
          >
            {CTA.headline}
          </h2>

          <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            {CTA.body}
          </p>
        </div>

        <div data-reveal className="lg:col-span-5">
          <ul className="space-y-px border-y border-white/25 bg-white/25">
            <li>
              <a
                href={`tel:${COMPANY.phone.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-4 bg-brand px-1 py-5 transition-colors duration-200 hover:bg-brand-600"
              >
                <Phone className="h-4 w-4 shrink-0 text-white/70" />
                <span className="t-display-sm text-lg">{COMPANY.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-4 bg-brand px-1 py-5 transition-colors duration-200 hover:bg-brand-600"
              >
                <Mail className="h-4 w-4 shrink-0 text-white/70" />
                <span className="t-display-sm break-all text-lg">{COMPANY.email}</span>
              </a>
            </li>
          </ul>

          <a
            href="#contact"
            className="btn mt-6 w-full bg-white pl-6 pr-2.5 text-ink hover:bg-white/90"
          >
            Send the details instead
            <span className="btn-badge ml-auto bg-ink/10">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
