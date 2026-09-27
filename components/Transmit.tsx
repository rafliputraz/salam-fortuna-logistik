'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { COMPANY, PRIMARY_CTA, SERVICES, telHref } from '@/lib/company'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { ArrowRight, Check, Mail, Phone, Pin } from './icons'

const { address, hours } = COMPANY
const ADDRESS_LINES = [address.street, `${address.area}, ${address.city} ${address.postcode}`, address.country]

type Errors = Partial<Record<'name' | 'email' | 'details', string>>

/**
 * The enquiry, as a call over the radio to the Panjang desk. A signal meter
 * breathes beside the form and jumps while you type. No backend on this
 * site, so it composes the enquiry and hands it to the visitor's mail
 * client; swap the handler for a POST when an endpoint exists.
 */
export default function Transmit() {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const scope = useRef<HTMLElement>(null)
  const kick = useRef<(() => void) | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', scope.current)
      const idle = bars.map((b, i) =>
        gsap.to(b, { scaleY: gsap.utils.random(0.15, 0.5), duration: gsap.utils.random(0.5, 1.1), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.05 })
      )
      kick.current = () =>
        bars.forEach((b) =>
          gsap.fromTo(b, { scaleY: gsap.utils.random(0.6, 1) }, { scaleY: 0.3, duration: 0.5, ease: 'power2.out', overwrite: 'auto' })
        )
      return () => idle.forEach((t) => t.kill())
    },
    { scope }
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()

    const next: Errors = {}
    if (!get('name')) next.name = 'Tell us who to reply to.'
    if (!/^\S+@\S+\.\S+$/.test(get('email'))) next.email = 'That email address looks incomplete.'
    if (get('details').length < 8) next.details = 'Add the cargo, the lane and roughly when.'
    setErrors(next)
    if (Object.keys(next).length) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus()
      return
    }

    const body = [
      `Name:    ${get('name')}`,
      `Company: ${get('company')}`,
      `Email:   ${get('email')}`,
      `Need:    ${get('need')}`,
      '',
      get('details'),
    ].join('\n')
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(`Enquiry: ${get('need')}`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section ref={scope} id="contact" className="chart-grid relative border-t border-line py-24 md:py-36">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="t-label text-cyan">Channel 16 · the desk</p>
          <h2 data-split className="t-display mt-5 text-[length:var(--text-display-s)] text-ink">
            Tell us what&apos;s moving.
          </h2>
          <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
            Cargo, lane, and when it has to be there. You get a rate and a schedule back, not
            a brochure.
          </p>

          <DeskStatus />

          <ul data-reveal className="mt-10 space-y-5">
            <li className="flex gap-4">
              <Pin className="mt-1 h-5 w-5 shrink-0 text-signal" />
              <address className="not-italic leading-relaxed text-ink-2">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-signal" />
              <a href={telHref} className="navlink self-start !text-base !normal-case !tracking-normal text-ink">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-signal" />
              <a href={`mailto:${COMPANY.email}`} className="navlink self-start !text-base !normal-case !tracking-normal text-ink">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7">
          <form data-reveal noValidate onSubmit={handleSubmit} onInput={() => kick.current?.()} className="bezel p-6 md:p-10">
            <div className="flex items-center justify-between gap-6 border-b border-line pb-5">
              <p className="t-label text-ink">
                Transmit to <span className="text-signal">{COMPANY.basePort.code}</span>
              </p>
              <div aria-hidden="true" className="flex h-6 items-end gap-[3px]">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} data-bar className="w-[3px] origin-bottom bg-cyan" style={{ height: '100%', transform: 'scaleY(0.3)' }} />
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <Field label="Your name" name="name" autoComplete="name" error={errors.name} />
              <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
              <div className="sm:col-span-2">
                <Field label="Company" name="company" autoComplete="organization" optional />
              </div>
            </div>

            <fieldset className="mt-10">
              <legend className="t-label text-ink-3">What do you need</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {SERVICES.map((s, i) => (
                  <label key={s.title} className="cursor-pointer">
                    <input type="radio" name="need" value={s.title} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="t-label block border border-line-strong px-4 py-2.5 text-ink-2 transition-colors duration-200 hover:border-ink/50 hover:text-ink peer-checked:border-signal peer-checked:bg-signal peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
                      {s.title}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-10">
              <label className="t-label block text-ink-3" htmlFor="details">
                Cargo, lane, and timing
              </label>
              <textarea
                id="details"
                name="details"
                rows={3}
                placeholder="2 x 40HC robusta, Panjang to Port Klang, loading week 34"
                aria-invalid={Boolean(errors.details)}
                aria-describedby={errors.details ? 'details-error' : undefined}
                className="field mt-1 resize-y"
              />
              {errors.details && <FieldError id="details-error">{errors.details}</FieldError>}
            </div>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p aria-live="polite" className="max-w-xs text-sm leading-relaxed text-ink-3">
                {sent ? (
                  <span className="flex gap-2 text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-go" />
                    Your mail app should have opened with the enquiry written out. If not, write to {COMPANY.email}.
                  </span>
                ) : (
                  <>Opens the enquiry in your mail app, addressed to our desk.</>
                )}
              </p>
              <button type="submit" className="btn-signal">
                {PRIMARY_CTA}
                <ArrowRight className="btn-arrow h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

/**
 * Local time at Panjang and whether the office is staffed right now, worked
 * out from the published hours. The port line answers around the clock.
 */
function DeskStatus() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  if (!now) return <div className="mt-10 h-[4.75rem]" aria-hidden="true" />

  const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 7 * 60) * 60_000)
  const hh = String(wib.getHours()).padStart(2, '0')
  const mm = String(wib.getMinutes()).padStart(2, '0')
  const open =
    (hours.openDays as readonly number[]).includes(wib.getDay()) && wib.getHours() >= hours.openHour && wib.getHours() < hours.closeHour

  return (
    <div className="bezel mt-10 inline-flex items-center gap-5 py-3 pl-5 pr-6">
      <span className="t-display text-[2.6rem] tabular-nums text-cyan">
        {hh}:{mm}
      </span>
      <span className="leading-snug">
        <span className="t-label block text-ink-3">Panjang · WIB</span>
        <span className="flex items-center gap-2 text-sm text-ink-2">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${open ? 'bg-go' : 'bg-ink-3'}`} />
          {open ? 'Office open now' : 'Office closed. The port line still answers.'}
        </span>
      </span>
    </div>
  )
}

function Field({
  label,
  name,
  error,
  optional,
  ...props
}: { label: string; name: string; error?: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="t-label block text-ink-3" htmlFor={name}>
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        className="field mt-1"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && <FieldError id={`${name}-error`}>{error}</FieldError>}
    </div>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-sm font-medium text-route">
      {children}
    </p>
  )
}
