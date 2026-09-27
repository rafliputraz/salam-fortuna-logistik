import Image from 'next/image'
import { COMPANY, CTA, telHref } from '@/lib/company'
import { containerSrc, VIEWS } from '@/lib/containers'
import { ArrowRight } from './icons'

/**
 * The one section that is brand red end to end. The label above is the
 * considered route; this is the direct one, the number set as big as a
 * headline for anyone who would rather just call.
 */
export default function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden bg-signal-deep text-paper">
      {/* A box on the hook, waiting on your call. */}
      <div aria-hidden="true" className="absolute right-[6%] top-0 hidden w-[19rem] lg:block">
        <div className="hang-swing">
          <span className="absolute inset-x-0 bottom-[99%] h-40 bg-[url(/images/containers/cable.webp)] bg-[length:100%_auto] bg-repeat-y" />
          <Image src={containerSrc('hanging', 'cobalt')} alt="" width={VIEWS.hanging.w} height={VIEWS.hanging.h} sizes="19rem" className="h-auto w-full" />
        </div>
      </div>
      <div className="shell relative py-20 md:py-28">
        <h2 id="cta-heading" data-split className="t-display max-w-[16ch] text-[length:var(--text-4xl)]">
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
