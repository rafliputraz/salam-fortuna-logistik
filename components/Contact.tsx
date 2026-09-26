'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { COMPANY, PRIMARY_CTA, telHref } from '@/lib/company'
import { ArrowRight, Check, Mail, Phone, Pin } from './icons'

const NEEDS = [
  'Sea freight, export',
  'Sea freight, import',
  'Domestic inter-island',
  'Customs & documents',
  'Inland trucking',
  'Ship agency / husbandry',
]

const { address, hours } = COMPANY
const ADDRESS_LINES = [
  address.street,
  `${address.area}, ${address.city} ${address.postcode}`,
  address.country,
]

type Errors = Partial<Record<'name' | 'email' | 'details', string>>
type Status = 'idle' | 'sent'

/**
 * No backend on this site, so the form composes the enquiry and hands it to
 * the visitor's mail client. It does something real rather than pretending
 * to send. Swap the handler for a POST when an endpoint exists.
 */
export default function Contact() {
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')

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
      const first = Object.keys(next)[0]
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
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
    setStatus('sent')
  }

  return (
    <section id="contact" className="border-t border-rule bg-hull py-24 md:py-36">
      <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 data-reveal className="t-display text-[length:var(--text-display-s)] text-foam">
            Tell us what&apos;s moving.
          </h2>
          <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-steel">
            Cargo, lane, and when it has to be there. You get a rate and a schedule
            back, not a brochure.
          </p>

          <DeskStatus />

          <ul data-reveal className="mt-10 space-y-6">
            <li className="flex gap-4">
              <Pin className="mt-1 h-5 w-5 shrink-0 text-signal-lift" />
              <address className="not-italic leading-relaxed text-steel">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-signal-lift" />
              <a href={telHref} className="navlink self-start text-lg text-foam">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-signal-lift" />
              <a href={`mailto:${COMPANY.email}`} className="navlink self-start text-lg text-foam">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <form data-reveal noValidate onSubmit={handleSubmit} className="border border-rule bg-abyss p-6 md:p-10">
            <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-5">
              <p className="t-head text-2xl text-foam">Booking enquiry</p>
              <p className="t-label text-fog">To {COMPANY.basePort.code}</p>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <Field label="Your name" name="name" autoComplete="name" error={errors.name} />
              <Field label="Company" name="company" autoComplete="organization" optional />
            </div>
            <div className="mt-8">
              <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
            </div>

            <fieldset className="mt-10">
              <legend className="t-label mb-4 text-fog">What do you need</legend>
              <div className="flex flex-wrap gap-2">
                {NEEDS.map((n, i) => (
                  <label key={n} className="cursor-pointer">
                    <input
                      type="radio"
                      name="need"
                      value={n}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full border border-rule-strong px-4 py-2 text-sm text-steel transition-colors duration-200 hover:border-foam/60 peer-checked:border-signal peer-checked:bg-signal-deep peer-checked:text-foam peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal-lift">
                      {n}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-10">
              <label className="t-label mb-1 block text-fog" htmlFor="details">
                Cargo, lane, and timing
              </label>
              <textarea
                id="details"
                name="details"
                rows={4}
                placeholder="2 x 40HC robusta, Panjang to Port Klang, loading week 34"
                aria-invalid={Boolean(errors.details)}
                aria-describedby={errors.details ? 'details-error' : undefined}
                className="field resize-y"
              />
              {errors.details && <FieldError id="details-error">{errors.details}</FieldError>}
            </div>

            <button type="submit" className="btn-signal mt-10 w-full sm:w-auto">
              {PRIMARY_CTA}
              <ArrowRight className="btn-arrow h-4 w-4" />
            </button>

            <p aria-live="polite" className="mt-5 min-h-[3rem] text-sm leading-relaxed text-steel">
              {status === 'sent' ? (
                <span className="flex gap-2 text-foam">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-go" />
                  Your mail app should have opened with the enquiry written out. If it
                  didn&apos;t, write to {COMPANY.email}.
                </span>
              ) : (
                <>Opens the enquiry in your mail app, addressed to our desk.</>
              )}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

/**
 * Local time at Panjang and whether the office is staffed right now.
 * Worked out from the published hours, not from a feed: the port line is
 * answered around the clock either way.
 */
function DeskStatus() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  if (!now) return <div className="mt-10 h-[3.25rem]" aria-hidden="true" />

  // WIB is UTC+7 all year.
  const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 7 * 60) * 60_000)
  const hh = String(wib.getHours()).padStart(2, '0')
  const mm = String(wib.getMinutes()).padStart(2, '0')
  const open =
    (hours.openDays as readonly number[]).includes(wib.getDay()) &&
    wib.getHours() >= hours.openHour &&
    wib.getHours() < hours.closeHour

  return (
    <div className="mt-10 flex items-center gap-4 border-y border-rule py-4">
      <span className="t-display text-4xl tabular-nums text-foam">
        {hh}:{mm}
      </span>
      <span className="leading-snug">
        <span className="t-label block text-fog">Panjang, WIB</span>
        <span className="flex items-center gap-2 text-sm text-steel">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${open ? 'bg-go' : 'bg-fog'}`}
          />
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
}: {
  label: string
  name: string
  error?: string
  optional?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="t-label mb-1 block text-fog" htmlFor={name}>
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-fog/80">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        className="field"
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
    <p id={id} className="mt-2 text-sm text-signal-lift">
      {children}
    </p>
  )
}
