/**
 * Single source of truth for everything factual on the page.
 * Edit here, not in the components.
 */

export const COMPANY = {
  legalName: 'PT Salam Fortuna Logistik',
  shortName: 'Salam Fortuna Logistik',
  initials: 'SFL',
  tagline: 'Freight forwarding & ship agency',
  basePort: {
    code: 'IDPNJ',
    name: 'Panjang Port',
    city: 'Bandar Lampung',
    coords: '05°28′S 105°19′E',
  },
  address: {
    street: 'Ruko Little Europe Blok C No. 7',
    area: 'Citra Garden',
    city: 'Bandar Lampung',
    postcode: '35233',
    country: 'Indonesia',
  },
  // TODO(client): verify. 0271 is the Surakarta area code; Bandar Lampung is 0721.
  phone: '(0271) 8127939286',
  // TODO(client): replace with the live mailbox before launch.
  email: 'contact@salamfortuna.com',
  hours: {
    port: 'Port cover, 24 hours',
    office: 'Office Mon to Sat, 08:00 to 17:00 WIB',
    // Used by the live office-status readout in the contact section.
    openDays: [1, 2, 3, 4, 5, 6],
    openHour: 8,
    closeHour: 17,
  },
} as const

/**
 * The scroll story over the ship. One chapter per camera move; the copy is
 * what the shot is showing.
 */
export const CHAPTERS = [
  {
    id: 'arrival',
    side: 'left',
    label: 'Arrival',
    title: 'We clear the port before your ship arrives.',
    body:
      'Freight forwarding and ship agency out of Panjang. Sea freight, customs, trucking and husbandry, one team on one file.',
  },
  {
    id: 'sea',
    side: 'left',
    label: 'Sea freight',
    title: 'Booked direct with the lines.',
    body:
      'FCL, LCL, breakbulk and project cargo through Panjang and the main Indonesian gateways. A rate from the carrier, not a broker quoting a broker.',
  },
  {
    id: 'file',
    side: 'left',
    label: 'One file',
    title: 'Every box, on one file.',
    body:
      'Empty release, stuffing, sailing, clearance, delivery. The same team carries your shipment the whole way, so nothing is lost between desks.',
  },
  {
    id: 'agency',
    side: 'right',
    label: 'Ship agency',
    title: 'One call for the master.',
    body:
      'Port clearance, crew change, bunkers and stores, arranged by one agent who reports to the owner for the whole call.',
  },
  {
    id: 'inland',
    side: 'left',
    label: 'Delivery',
    title: 'Cleared, and on its way inland.',
    body:
      'PEB and PIB filed, permits in hand, and your cargo moving from the terminal to the door across Lampung and on through Bakauheni.',
  },
] as const

/**
 * The five legs of a shipment, in the order they actually happen. The
 * numbering on the page is load-bearing: this is a sequence, not a list.
 */
export const VOYAGE = [
  {
    code: 'BOOKING',
    title: 'Rate & booking',
    body:
      'You send the cargo, lane, and window. We come back with a rate and a slot from the lines we book with directly.',
    detail: ['FCL & LCL rates', 'Slot confirmation', 'Schedule locking'],
  },
  {
    code: 'ORIGIN',
    title: 'Origin handling',
    body:
      'Empty release, stuffing supervision, warehouse receipt and seal records, with photographs, so the condition at stuffing is never in dispute.',
    detail: ['Container release', 'Stuffing supervision', 'Seal & photo record'],
  },
  {
    code: 'SEA',
    title: 'Sea freight',
    body:
      'Import, export and domestic moves through Panjang and the other main Indonesian gateways, on alliances built over years rather than per shipment.',
    detail: ['Import & export', 'Domestic inter-island', 'Special equipment'],
  },
  {
    code: 'CLEARANCE',
    title: 'Customs & documents',
    body:
      'PEB and PIB filing, bills of lading, certificates of origin, and the permits your commodity needs. Our team files it; you approve it.',
    detail: ['PEB / PIB filing', 'B/L & COO', 'Permits & licences'],
  },
  {
    code: 'INLAND',
    title: 'Inland delivery',
    body:
      'Trucking from the terminal to the door across Lampung and onward through Bakauheni, on a trucker network we hold accountable ourselves.',
    detail: ['Terminal to door', 'Cross-Sumatra haulage', 'Delivery proof'],
  },
] as const

/** Husbandry scope, grouped the way a master actually asks for it. */
export const HUSBANDRY = [
  {
    title: 'Port clearance',
    body: 'KSOP, Bea Cukai, Karantina and Imigrasi handled before the pilot boards.',
  },
  {
    title: 'Crew & cash',
    body: 'Crew change, medical, repatriation, and cash to master on arrival.',
  },
  {
    title: 'Supply & bunkers',
    body: 'Provisions, fresh water, bunkers and spare parts alongside the berth.',
  },
  {
    title: "Owner's protective",
    body: 'An agent reporting to you, not to the charterer, for the whole call.',
  },
] as const

export const PRINCIPLES = [
  {
    title: 'We answer',
    body:
      'A named person on your shipment who picks up outside office hours. Ships do not wait for Monday.',
  },
  {
    title: 'We tell you early',
    body:
      'A delay you hear about on Tuesday is a problem. On Friday it is a crisis. Bad news travels fast here.',
  },
  {
    title: 'We solve, then invoice',
    body:
      'Detention, a rolled booking, a document held at the counter. We move first and settle the cost after.',
  },
  {
    title: 'We show our work',
    body:
      'Seal numbers, gate timings, filing references. Every claim on your file is one you can check.',
  },
] as const

/** The company vision, carried over from the original profile. */
export const VISION =
  'To become the best service provider in the maritime transportation industry, with optimal and professional service built on trust.'

/**
 * Gateways we move cargo through, for the scrolling band.
 * TODO(client): trim to the ports you genuinely cover. This is a claim.
 */
export const PORTS = [
  { name: 'Panjang', code: 'IDPNJ' },
  { name: 'Tanjung Priok', code: 'IDTPP' },
  { name: 'Tanjung Perak', code: 'IDSUB' },
  { name: 'Belawan', code: 'IDBLW' },
  { name: 'Batam', code: 'IDBTM' },
  { name: 'Semarang', code: 'IDSRG' },
  { name: 'Makassar', code: 'IDUPG' },
  { name: 'Banjarmasin', code: 'IDBDJ' },
  { name: 'Bakauheni', code: 'IDBKH' },
] as const

/** The closing band. Deliberately short: it is a door, not a pitch. */
export const CTA = {
  headline: 'Something to move? Start with a phone call.',
  body:
    'Tell us the cargo and the lane. If we are not the right people for it, we will say so and tell you who is.',
} as const

/**
 * Questions we actually get asked. Kept factual and free of figures: nothing
 * here commits the company to a number it would have to defend.
 */
export const FAQ = [
  {
    q: 'What do you need from me to quote a rate?',
    a: 'Commodity, packing, weight and volume, the loading and discharge ports, and roughly when it has to move. If you know your Incoterm, say so. That is enough for a first rate; anything missing we will ask about rather than guess.',
  },
  {
    q: 'Should I book FCL or LCL?',
    a: 'If your cargo fills most of a container, FCL is usually cheaper per unit and handles less. Below that, LCL means you only pay for the space you use, at the cost of consolidation time at both ends. Tell us the volume and we will price both.',
  },
  {
    q: 'Who handles customs, you or my broker?',
    a: 'We do, unless you would rather keep your own broker. Our team files the PEB for exports and the PIB for imports, and arranges certificates of origin and any commodity permits. You approve the declaration before it is submitted.',
  },
  {
    q: 'Is my cargo insured?',
    a: 'Not automatically. Carrier liability is limited by the bill of lading and rarely covers the value of the goods. We can arrange marine cargo insurance on request. Tell us the invoice value and we will quote it alongside the freight.',
  },
  {
    q: 'What happens if the container is held at the port?',
    a: 'We tell you the same day, with the reason and what it will take to release it. Demurrage and detention are billed at cost with the carrier invoice attached. We do not mark them up, and we do not wait for your approval before acting to stop the clock.',
  },
  {
    q: 'Do you work ports outside Lampung?',
    a: 'Yes. Panjang is our base and where our own people are, but we book and clear through the other main Indonesian gateways too. For ports where we are not physically present, we appoint and supervise the agent rather than hand you over to them.',
  },
] as const

export const NAV = [
  { href: '#voyage', label: 'What we handle' },
  { href: '#agency', label: 'Ship agency' },
  { href: '#standards', label: 'How we work' },
  { href: '#contact', label: 'Contact' },
] as const

/** One label per intent, used everywhere a rate is asked for. */
export const PRIMARY_CTA = 'Request a rate'

export const telHref = `tel:${COMPANY.phone.replace(/[^\d+]/g, '')}`
