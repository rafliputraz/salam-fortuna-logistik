'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { COMPANY, PRIMARY_CTA, SERVICES, telHref } from '@/lib/company'
import { ArrowRight, Check, Mail, Phone, Pin } from './icons'

const { address, hours } = COMPANY
const ADDRESS_LINES = [address.street, `${address.area}, ${address.city} ${address.postcode}`, address.country]

type Errors = Partial<Record<'name' | 'email' | 'details', string>>

/**
 * The enquiry form. No backend on this site, so it composes the enquiry and
 * hands it to the visitor's mail client. Swap the handler for a POST when an
 * endpoint exists.
 */
export default function Contact() {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const scope = useRef<HTMLElement>(null)

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
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(
      `Enquiry: ${get('need')}`
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section ref={scope} id="contact" className="py-24 md:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow">Contact</p>
          <h2 data-split className="t-h2 mt-4 text-ink">
            Tell us what&apos;s moving.
          </h2>
          <p data-reveal className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
            Cargo, lane, and when it has to be there. You get a rate and a schedule back, not a
            brochure.
          </p>

          <DeskStatus />

          <ul data-reveal className="mt-10 space-y-4">
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-3 text-ink">
                <Pin className="h-5 w-5" />
              </span>
              <address className="not-italic leading-relaxed text-ink-2">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-3 text-ink">
                <Phone className="h-5 w-5" />
              </span>
              <a href={telHref} className="font-semibold text-ink hover:text-signal">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-3 text-ink">
                <Mail className="h-5 w-5" />
              </span>
              <a href={`mailto:${COMPANY.email}`} className="font-semibold text-ink hover:text-signal">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7">
          <form data-reveal noValidate onSubmit={handleSubmit} className="card p-6 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" name="name" autoComplete="name" error={errors.name} />
              <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
              <div className="sm:col-span-2">
                <Field label="Company" name="company" autoComplete="organization" optional />
              </div>
            </div>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-ink">What do you need?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {SERVICES.map((s, i) => (
                  <label key={s.title} className="cursor-pointer">
                    <input type="radio" name="need" value={s.title} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="block rounded-full px-4 py-2 text-sm font-medium text-ink-2 ring-1 ring-inset ring-line-strong transition-colors duration-200 hover:ring-ink/40 peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
                      {s.title}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-7">
              <label className="text-sm font-semibold text-ink" htmlFor="details">
                Cargo, lane, and timing
              </label>
              <textarea
                id="details"
                name="details"
                rows={4}
                placeholder="2 x 40HC robusta, Panjang to Port Klang, loading week 34"
                aria-invalid={Boolean(errors.details)}
                aria-describedby={errors.details ? 'details-error' : undefined}
                className="field mt-2 resize-y"
              />
              {errors.details && <FieldError id="details-error">{errors.details}</FieldError>}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
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

  if (!now) return <div className="mt-8 h-[4.5rem]" aria-hidden="true" />

  const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 7 * 60) * 60_000)
  const hh = String(wib.getHours()).padStart(2, '0')
  const mm = String(wib.getMinutes()).padStart(2, '0')
  const open =
    (hours.openDays as readonly number[]).includes(wib.getDay()) &&
    wib.getHours() >= hours.openHour &&
    wib.getHours() < hours.closeHour

  return (
    <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-paper-2 py-3 pl-5 pr-6 ring-1 ring-line">
      <span className="text-3xl font-bold tabular-nums tracking-tight text-ink">
        {hh}:{mm}
      </span>
      <span className="leading-snug">
        <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">Panjang · WIB</span>
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
      <label className="text-sm font-semibold text-ink" htmlFor={name}>
        {label}
        {optional && <span className="ml-2 font-normal text-ink-3">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        className="field mt-2"
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
    <p id={id} className="mt-2 text-sm font-medium text-signal">
      {children}
    </p>
  )
}
