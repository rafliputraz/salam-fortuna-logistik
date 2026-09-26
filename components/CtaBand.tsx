import { COMPANY, CTA, telHref } from '@/lib/company'
import { ArrowRight } from './icons'

/**
 * The one section that is brand red end to end. The label above is the
 * considered route; this is the direct one, the number set as big as a
 * headline for anyone who would rather just call.
 */
export default function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="bg-signal-deep text-paper">
      <div className="shell py-20 md:py-28">
        <h2 id="cta-heading" data-reveal className="t-display max-w-[16ch] text-[length:var(--text-4xl)]">
          {CTA.headline}
        </h2>
        <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">
          {CTA.body}
        </p>
        <a
          data-reveal
          href={telHref}
          className="group mt-12 flex items-center justify-between gap-6 border-t-2 border-paper/30 pt-8"
        >
          <span className="t-display text-[clamp(2.4rem,8.5vw,8rem)] leading-none">{COMPANY.phone}</span>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper text-signal-deep transition-transform duration-300 ease-out group-hover:translate-x-1 group-active:scale-95 md:h-20 md:w-20">
            <ArrowRight className="h-6 w-6" />
          </span>
        </a>
      </div>
    </section>
  )
}
