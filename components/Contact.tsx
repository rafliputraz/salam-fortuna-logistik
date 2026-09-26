'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState, type FormEvent } from 'react'
import { COMPANY, PRIMARY_CTA, SERVICES, telHref } from '@/lib/company'
import { boxColor } from './Box'
import { ArrowRight, Check, Mail, Phone, Pin } from './icons'

const { address, hours } = COMPANY
const ADDRESS_LINES = [address.street, `${address.area}, ${address.city} ${address.postcode}`, address.country]

type Errors = Partial<Record<'name' | 'email' | 'details', string>>

/**
 * The enquiry, laid out as the shipping label you'd slap on a box: sender,
 * consignee, what's inside, and a barcode for good measure. No backend on
 * this site, so it composes the enquiry and hands it to the visitor's mail
 * client. Swap the handler for a POST when an endpoint exists.
 */
export default function Contact() {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

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
    <section id="contact" className="bg-paper py-24 md:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 data-reveal className="t-display text-[length:var(--text-display-s)] text-ink">
            Tell us what&apos;s moving.
          </h2>
          <p data-reveal className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
            Cargo, lane, and when it has to be there. You get a rate and a schedule
            back, not a brochure.
          </p>

          <DeskStatus />

          <ul data-reveal className="mt-8 space-y-5">
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
              <a href={telHref} className="navlink self-start text-lg text-ink">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-signal" />
              <a href={`mailto:${COMPANY.email}`} className="navlink self-start text-lg text-ink">
                {COMPANY.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7">
          <form
            data-reveal
            noValidate
            onSubmit={handleSubmit}
            className="rotate-[-0.6deg] border-[3px] border-ink bg-paper shadow-[10px_10px_0_oklch(var(--c-ink))] transition-transform duration-300 ease-out focus-within:rotate-0"
          >
            <div className="flex items-stretch justify-between border-b-[3px] border-ink">
              <p className="t-display px-6 py-4 text-[2rem] text-ink">Booking label</p>
              <p className="t-label flex items-center bg-ink px-5 text-paper">To {COMPANY.basePort.code}</p>
            </div>

            <div className="grid border-b-[3px] border-ink sm:grid-cols-2">
              <div className="border-b-[3px] border-ink p-6 sm:border-b-0 sm:border-r-[3px]">
                <p className="t-label text-ink-3">From</p>
                <div className="mt-3 space-y-5">
                  <Field label="Your name" name="name" autoComplete="name" error={errors.name} />
                  <Field label="Company" name="company" autoComplete="organization" optional />
                </div>
              </div>
              <div className="p-6">
                <p className="t-label text-ink-3">Reply to</p>
                <div className="mt-3">
                  <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
                </div>
              </div>
            </div>

            <fieldset className="border-b-[3px] border-ink p-6">
              <legend className="sr-only">What do you need</legend>
              <p aria-hidden="true" className="t-label mb-4 text-ink-3">
                Contents
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s, i) => (
                  <label key={s.title} className="cursor-pointer">
                    <input type="radio" name="need" value={s.title} defaultChecked={i === 0} className="peer sr-only" />
                    <span
                      className="block rounded-full border-2 border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40 peer-checked:border-transparent peer-checked:bg-[var(--c)] peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-box-cobalt"
                      style={{ '--c': boxColor(s.color) } as CSSProperties}
                    >
                      {s.title}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="border-b-[3px] border-ink p-6">
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

            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <Barcode />
              <button type="submit" className="btn-signal">
                {PRIMARY_CTA}
                <ArrowRight className="btn-arrow h-4 w-4" />
              </button>
            </div>
            <p aria-live="polite" className="min-h-[3rem] px-6 pb-5 text-sm leading-relaxed text-ink-2">
              {sent ? (
                <span className="flex gap-2 text-ink">
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

/** Decorative, like the barcode on every real label. */
function Barcode() {
  const bars = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2]
  return (
    <div aria-hidden="true" className="flex h-12 items-stretch gap-[3px]">
      {bars.map((w, i) => (
        <span key={i} className={i % 2 ? 'bg-transparent' : 'bg-ink'} style={{ width: w * 2 }} />
      ))}
    </div>
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
    <div className="mt-8 inline-flex items-center gap-4 rounded-full border-2 border-ink/10 py-2 pl-5 pr-6">
      <span className="t-display text-3xl tabular-nums text-ink">
        {hh}:{mm}
      </span>
      <span className="leading-snug">
        <span className="t-label block text-ink-3">Panjang, WIB</span>
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
    <p id={id} className="mt-2 text-sm font-medium text-signal-deep">
      {children}
    </p>
  )
}
