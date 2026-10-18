import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarPlus,
  CalendarCheck,
  Database,
  Eye,
  Globe,
  Monitor,
  Rocket,
  Search,
  Server,
  Star,
  Ticket,
  UserPlus,
} from 'lucide-react'
import { btnPrimary } from '@/lib/styles'

const participant = [
  { icon: UserPlus, title: 'Create a free account', text: 'Just your name, email and a password.' },
  { icon: Search, title: 'Find an event', text: 'Search, or filter by category and date.' },
  {
    icon: CalendarCheck,
    title: 'Press Register',
    text: 'You get a seat instantly. If the event is full, you join the waitlist automatically.',
  },
  {
    icon: Ticket,
    title: 'Keep your ticket',
    text: 'Find it under My tickets. Cancel any time before the event, and your seat goes to the next person in line.',
  },
  { icon: Star, title: 'Rate it afterwards', text: 'Tell the organisers how it went.' },
]

const organiser = [
  {
    icon: UserPlus,
    title: 'Get an organiser account',
    text: 'Organiser accounts are created by an administrator, so strangers can’t publish events.',
  },
  {
    icon: CalendarPlus,
    title: 'Create an event',
    text: 'Add the title, date, venue, category and number of seats. It starts as a private draft.',
  },
  {
    icon: Rocket,
    title: 'Publish it',
    text: 'The system checks that the venue is free at that time, then makes it visible to everyone.',
  },
  {
    icon: Eye,
    title: 'Watch sign-ups',
    text: 'The dashboard shows registrations, waitlists, check-ins and ratings as they come in.',
  },
]

const flow = [
  { icon: Monitor, title: 'You', text: 'Click Register in your browser' },
  { icon: Globe, title: 'Website', text: 'The React site sends the request' },
  { icon: Server, title: 'API', text: 'The server checks the rules: logged in? seat free?' },
  { icon: Database, title: 'Database', text: 'Neon PostgreSQL saves it permanently' },
]

const saved = [
  { what: 'Your account', where: 'User table', note: 'Passwords are scrambled and can never be read back' },
  { what: 'Events, venues, categories', where: 'Event, Venue and Category tables', note: 'Shared by everyone' },
  { what: 'Tickets and waitlist spots', where: 'Registration table', note: 'One row per person per event, so no duplicates' },
  { what: 'Ratings and comments', where: 'Feedback table', note: 'One rating per attendee per event' },
  { what: 'Your login', where: 'A secure cookie in your browser', note: 'Only a signed token, never your password' },
]

const faq = [
  {
    q: 'Where is my data saved?',
    a: 'In a PostgreSQL database hosted in the cloud, not on your computer. That’s why your tickets show up on any device you log in from.',
  },
  {
    q: 'Why can’t I create an event?',
    a: 'Creating events is for organisers. Participants register for events, and organisers publish them. This keeps the event list trustworthy.',
  },
  {
    q: 'What happens if an event is full?',
    a: 'You’re added to the waitlist in the order you joined. If someone cancels, the first person waiting is confirmed automatically.',
  },
  {
    q: 'Can I cancel my registration?',
    a: 'Yes, from My tickets, any time before the event starts. Your seat is released straight away.',
  },
]

export default function HowItWorks() {
  const [tab, setTab] = useState<'participant' | 'organiser'>('participant')
  const steps = tab === 'participant' ? participant : organiser

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
        How EventEase works
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        EventEase connects people who run events with people who want to attend them. Pick your
        role to see exactly what happens.
      </p>

      <div
        className="mt-8 inline-flex rounded-2xl border border-line bg-card p-1"
        role="group"
        aria-label="Choose your role"
      >
        {(
          [
            ['participant', 'I want to attend'],
            ['organiser', 'I run events'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              tab === value ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li
            key={title}
            className="rounded-3xl border border-line bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <Icon size={22} aria-hidden="true" />
              </div>
              <span className="font-display text-3xl font-extrabold text-line">{index + 1}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Link to={tab === 'participant' ? '/events' : '/login'} className={`${btnPrimary} px-6 py-3`}>
          {tab === 'participant' ? 'Browse events' : 'Organiser log in'}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          What happens when you click Register
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Every action follows the same path, and the rules are checked on the server so nobody can
          skip them.
        </p>

        <ol className="mt-8 grid gap-3 md:grid-cols-4">
          {flow.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative rounded-3xl bg-ink p-6 text-white">
              <Icon className="text-sun" size={26} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-white/70">{text}</p>
              {index < flow.length - 1 && (
                <ArrowRight
                  className="absolute -bottom-5 left-1/2 z-10 -translate-x-1/2 rotate-90 rounded-full bg-sun p-1 text-ink md:-right-5 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2 md:rotate-0"
                  size={26}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          Where your data lives
        </h2>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">What is saved, and where</caption>
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">What</th>
                <th scope="col" className="px-5 py-3">Saved in</th>
                <th scope="col" className="px-5 py-3">Good to know</th>
              </tr>
            </thead>
            <tbody>
              {saved.map((row) => (
                <tr key={row.what} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold">{row.what}</th>
                  <td className="px-5 py-4">{row.where}</td>
                  <td className="px-5 py-4 text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-20 max-w-3xl">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Common questions</h2>
        <div className="mt-6 space-y-3">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-line bg-card px-6 py-4 open:shadow-md"
            >
              <summary className="cursor-pointer list-none font-semibold marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-brand transition group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}