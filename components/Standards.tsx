import { PRINCIPLES, VISION } from '@/lib/company'

/**
 * White ground, wide margins, nothing moving. After the dark husbandry
 * section this is the page taking a breath, which is also the right register
 * for the four lines the client is meant to hold us to.
 */
export default function Standards() {
  return (
    <section id="standards" className="bg-surface-raised py-24 md:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p data-reveal className="t-data flex items-center gap-3 text-ink-soft">
            <span className="h-1.5 w-1.5 bg-brand" />
            03 · How we work
          </p>
          <h2
            data-reveal
            className="t-display mt-8 text-[clamp(2rem,4.2vw,3.1rem)] text-ink"
          >
            Four promises
            <br />
            you can hold
            <br />
            us to.
          </h2>
        </div>

        <div className="lg:col-span-8">
          <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} data-reveal className="bg-surface-raised p-7 md:p-9">
                <dt className="t-display-sm text-xl text-ink md:text-2xl">{p.title}</dt>
                <dd className="mt-4 leading-relaxed text-ink-soft">{p.body}</dd>
              </div>
            ))}
          </dl>

          <figure data-reveal className="mt-12 border-l-2 border-brand pl-7">
            <blockquote className="t-display-sm text-xl leading-snug text-ink md:text-2xl">
              {VISION}
            </blockquote>
            <figcaption className="t-data mt-4 text-ink-soft">Company vision</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
