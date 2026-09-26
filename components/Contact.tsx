'use client'

import type { FormEvent } from 'react'
import { COMPANY } from '@/lib/company'
import { ArrowRight, Clock, Mail, Phone, Pin } from './icons'

const NEEDS = [
  'Sea freight — export',
  'Sea freight — import',
  'Domestic inter-island',
  'Customs & documents',
  'Inland trucking',
  'Ship agency / husbandry',
]

const { address } = COMPANY
const ADDRESS_LINES = [
  address.street,
  `${address.area}, ${address.city} ${address.postcode}`,
  address.country,
]

/**
 * No backend on this site, so the form composes the enquiry and hands it to
 * the visitor's mail client. It does something real rather than pretending to
 * send. Swap the handler for a POST when an endpoint exists.
 */
export default function Contact() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()

    const body = [
      `Name:    ${get('name')}`,
      `Company: ${get('company')}`,
      `Email:   ${get('email')}`,
      `Need:    ${get('need')}`,
      '',
      get('details'),
    ].join('\n')

    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(
      `Enquiry — ${get('need')}`
    )}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="contact" className="border-t border-line bg-surface-sunken py-24 md:py-32">
      <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p data-reveal className="eyebrow">
            <span className="text-brand-600">05</span>
            <span>Contact</span>
          </p>

          <h2
            data-reveal
            className="t-display mt-8 text-[clamp(2rem,4.6vw,3.5rem)] text-ink"
          >
            Tell us what&apos;s
            <br />
            moving.
          </h2>

          <p data-reveal className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
            Cargo, lane, and when it has to be there. You get a rate and a schedule
            back — not a brochure.
          </p>

          <dl data-reveal className="mt-12 space-y-px border-y border-line bg-line">
            <ContactRow icon={<Pin className="h-4 w-4" />} label="Office">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </ContactRow>
            <ContactRow icon={<Phone className="h-4 w-4" />} label="Telephone">
              <a href={`tel:${COMPANY.phone.replace(/[^\d+]/g, '')}`} className="hover:text-brand-600">
                {COMPANY.phone}
              </a>
            </ContactRow>
            <ContactRow icon={<Mail className="h-4 w-4" />} label="Email">
              <a href={`mailto:${COMPANY.email}`} className="hover:text-brand-600">
                {COMPANY.email}
              </a>
            </ContactRow>
            <ContactRow icon={<Clock className="h-4 w-4" />} label="Hours">
              {COMPANY.hours}
            </ContactRow>
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <form data-reveal onSubmit={handleSubmit} className="panel p-7 md:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" name="name" autoComplete="name" required />
              <Field label="Company" name="company" autoComplete="organization" />
            </div>

            <div className="mt-5">
              <Field label="Email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className="mt-5">
              <label className="t-data mb-2.5 block text-ink-soft" htmlFor="need">
                What do you need
              </label>
              <div className="relative">
                <select id="need" name="need" required className="field appearance-none pr-10">
                  {NEEDS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -mt-0.5 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-ink-soft"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="t-data mb-2.5 block text-ink-soft" htmlFor="details">
                Cargo, lane, and timing
              </label>
              <textarea
                id="details"
                name="details"
                rows={5}
                required
                placeholder="2 x 40HC robusta, Panjang to Port Klang, loading week 34"
                className="field resize-y"
              />
            </div>

            <button type="submit" className="btn-primary mt-7 w-full">
              Send the enquiry
              <span className="btn-badge">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Opens the enquiry in your mail app, addressed to our team. Prefer to
              call? {COMPANY.phone}.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 bg-surface-sunken py-5 pr-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:pr-0">
      <dt className="t-data flex items-center gap-3 text-ink-soft">
        <span className="text-brand-600 sm:hidden">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
      </dt>
      <dd className="leading-relaxed text-ink">{children}</dd>
    </div>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="t-data mb-2.5 block text-ink-soft" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} className="field" {...props} />
    </div>
  )
}
