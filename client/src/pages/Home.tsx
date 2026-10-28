import { Link } from 'react-router-dom'
import PhotoGallery from '@/components/PhotoGallery'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserPlus,
  Zap,
} from 'lucide-react'
import CountUp from '@/components/CountUp'
import EventCard from '@/components/EventCard'
import Reveal from '@/components/Reveal'
import { useAuth } from '@/hooks/auth'
import { useVenues } from '@/hooks/adminQueries'
import { useCategories, useEvents, useMyRegistrations } from '@/hooks/queries'
import { formatDate, formatRange } from '@/lib/format'
import { registrationMap } from '@/lib/registrations'
import type { User } from '@/types'

const UPCOMING = 'when=upcoming&sort=startsAt&order=asc&limit=50'

const steps = [
  { icon: UserPlus, title: 'Create a free account', text: 'Sign up with your email. It takes under a minute.' },
  { icon: Search, title: 'Find an event', text: 'Browse workshops, seminars, competitions and webinars, or search by name.' },
  { icon: CalendarCheck, title: 'Reserve your seat', text: 'Press Register. If it’s full, you join the waitlist and move up when someone cancels.' },
  { icon: Ticket, title: 'Show up with your ticket', text: 'Every ticket is saved under My tickets, with a code for the door.' },
]

const features = [
  { icon: Zap, title: 'Instant confirmation', text: 'Your seat is saved the moment you press Register.' },
  { icon: Clock, title: 'A fair waitlist', text: 'First in line gets the next free seat, automatically.' },
  { icon: ShieldCheck, title: 'No double booking', text: 'The server checks every seat, so an event never goes over capacity.' },
  { icon: Ticket, title: 'Tickets in one place', text: 'See, keep and cancel every ticket from one page.' },
]

function UpcomingSection({ registered }: { registered: ReturnType<typeof registrationMap> }) {
  const { data } = useEvents(UPCOMING)
  const events = data?.events.slice(0, 3) ?? []
  if (events.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Happening soon</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Coming up</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline"
          >
            See all events <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          <Reveal key={event.id} delay={index * 120} className="h-full">
            <EventCard event={event} registered={registered.get(event.id)} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Landing() {
  const categories = useCategories()
  const venues = useVenues()
  const upcoming = useEvents(UPCOMING)

  const seatsOpen = (upcoming.data?.events ?? []).reduce((sum, event) => sum + event.seatsLeft, 0)
  const names = categories.data?.map((category) => category.name) ?? [
    'Workshop',
    'Seminar',
    'Competition',
    'Webinar',
  ]
  const half = [...names, ...names, ...names]

  const stats = [
    { label: 'Upcoming events', value: upcoming.data?.meta.total ?? 0 },
    { label: 'Seats open', value: seatsOpen },
    { label: 'Categories', value: categories.data?.length ?? 0 },
    { label: 'Venues', value: venues.data?.length ?? 0 },
  ]

  return (
    <>
      <section className="px-4 pt-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 sm:px-10 md:px-16 md:py-24">
                    <img
            src="/images/festival-ribbons.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/30"
          />
          <div aria-hidden="true" className="absolute -right-24 -top-28 size-104 animate-drift rounded-full bg-brand/60 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 size-96ate-drift rounded-full bg-coral/40 blur-3xl [animation-delay:-6s]" />
          <div aria-hidden="true" className="absolute right-1/3 top-1/2 size-48 animate-drift rounded-full bg-sun/20 blur-3xl [animation-delay:-3s]" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] bg-size-[26px_26px]"
          />

          <div className="relative grid items-center gap-14 md:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                <Sparkles size={15} className="text-sun" aria-hidden="true" />
                Now taking registrations
              </p>

              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white md:text-7xl">
                <span className="animate-rise block">Where every</span>
                <span className="animate-rise block [animation-delay:120ms]">
                  <span className="text-shimmer">great event</span>
                </span>
                <span className="animate-rise block [animation-delay:240ms]">begins.</span>
              </h1>

              <p className="animate-rise mt-6 max-w-lg text-lg text-white/70 [animation-delay:360ms]">
                Discover workshops, seminars, competitions and webinars. Reserve your seat in one
                click and keep every ticket in one place.
              </p>

              <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:480ms]">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-sun"
                >
                  Browse events <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Create free account
                </Link>
              </div>
            </div>

            <div className="relative mx-auto hidden h-104 w-full max-w-sm md:block" aria-hidden="true">
              <div className="animate-float absolute left-0 top-12 w-72 -rotate-6 rounded-3xl bg-white p-6 text-ink shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">
                    Admit one
                  </span>
                  <Ticket className="text-brand" size={22} />
                </div>
                <p className="mt-6 font-display text-3xl font-extrabold leading-tight">Your seat is saved</p>
                <p className="mt-1 text-sm text-muted">Confirmed and waiting for you</p>
                <div className="my-5 border-t-2 border-dashed border-line" />
                <div className="flex gap-1">
                  {Array.from({ length: 26 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-9 w-0.5 bg-ink"
                      style={{ opacity: index % 3 === 0 ? 1 : 0.5 }}
                    />
                  ))}
                </div>
              </div>

              <div className="animate-float-slow absolute right-0 top-0 w-44 rotate-6 rounded-2xl bg-sun p-4 text-ink shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wide">Seats left</p>
                <p className="font-display text-3xl font-extrabold">12</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/15">
                  <div className="h-full w-4/5 rounded-full bg-ink" />
                </div>
              </div>

              <div className="animate-float absolute bottom-2 right-4 flex items-center gap-2 rounded-2xl bg-coral px-4 py-3 text-sm font-bold text-white shadow-xl [animation-delay:-2s]">
                <Check size={18} /> You’re going!
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee overflow-hidden py-8" aria-hidden="true">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {half.map((name, index) => (
                <span
                  key={`${copy}-${index}`}
                  className="flex items-center gap-6 px-6 font-display text-3xl font-extrabold text-ink/15"
                >
                  {name}
                  <span className="size-2 rounded-full bg-coral" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <Reveal key={item.label} delay={index * 100}>
              <div className="rounded-3xl border border-line bg-card p-7 text-center transition hover:-translate-y-1 hover:shadow-xl">
                <p className="font-display text-6xl font-extrabold tracking-tight text-brand">
                  <CountUp to={item.value} />
                </p>
                <p className="mt-2 font-semibold text-muted">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">How it works</p>
            <h2 className="mt-2 max-w-xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              From curious to checked in, in four steps
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <Reveal delay={index * 120} className="h-full">
                  <div className="group h-full rounded-3xl border border-line bg-card p-7 transition duration-300 hover:-translate-y-2 hover:border-brand/40 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark transition group-hover:bg-brand group-hover:text-white">
                        <Icon size={26} aria-hidden="true" />
                      </div>
                      <span className="font-display text-5xl font-extrabold text-line">{index + 1}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold tracking-tight">{title}</h3>
                    <p className="mt-2 text-muted">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

            <PhotoGallery />

      <UpcomingSection registered={new Map()} />

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Why EventEase</p>
          <h2 className="mt-2 max-w-xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Built so nobody misses out
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 100}>
              <div className="flex gap-5 rounded-3xl border border-line bg-card p-7 transition hover:shadow-lg">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-sun">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                  <p className="mt-1 text-muted">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand via-[#7c5cff] to-coral p-10 text-center text-white md:p-16">
            <div aria-hidden="true" className="absolute -left-10 -top-10 size-48 animate-drift rounded-full bg-white/20 blur-2xl" />
            <h2 className="relative font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Ready to find your next event?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/85">
              Create a free account and reserve your first seat today.
            </p>
            <Link
              to="/register"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-dark transition hover:-translate-y-0.5 hover:bg-sun hover:text-ink"
            >
              Create your free account <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}

function Dashboard({ user }: { user: User }) {
  const mine = useMyRegistrations(true)
  const registrations = mine.data ?? []
  const registered = registrationMap(registrations)
  const isAdmin = user.role === 'ADMIN'
  const firstName = user.name.split(' ')[0]

  // "Welcome back" only makes sense if they have used the site before
  const greeting = mine.isPending
    ? 'Hello,'
    : registrations.length === 0
      ? 'Welcome to EventEase,'
      : 'Welcome back,'
  const isNew = !mine.isPending && registrations.length === 0

  const now = Date.now()
  const upcomingTickets = registrations.filter(
    (item) => item.status !== 'CANCELLED' && new Date(item.event.endsAt).getTime() > now,
  )
  const nextTicket = [...upcomingTickets]
    .filter((item) => item.status === 'CONFIRMED')
    .sort((a, b) => new Date(a.event.startsAt).getTime() - new Date(b.event.startsAt).getTime())[0]

  const hasRegistered = registered.size > 0

  const checklist = [
    { label: 'Create your account', done: true, to: '' },
    { label: 'Find and register for an event', done: hasRegistered, to: '/events' },
    { label: 'Check your ticket', done: hasRegistered, to: '/my-registrations' },
  ]

  const actions = [
    { to: '/events', icon: Search, title: 'Browse events', text: 'See what’s coming up and pick one.' },
    {
      to: '/my-registrations',
      icon: Ticket,
      title: 'My tickets',
      text: `${upcomingTickets.length} upcoming ticket${upcomingTickets.length === 1 ? '' : 's'}`,
    },
    isAdmin
      ? { to: '/admin', icon: LayoutDashboard, title: 'Organiser dashboard', text: 'Manage events and see sign-ups.' }
      : { to: '/events?when=past', icon: CalendarCheck, title: 'Past events', text: 'Look back at what you’ve attended.' },
  ]

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12">
        <h1 className="animate-rise font-display text-4xl font-extrabold tracking-tight md:text-6xl">
          {greeting} <span className="text-brand">{firstName}</span>
        </h1>
        <p className="animate-rise mt-3 max-w-xl text-lg text-muted [animation-delay:120ms]">
          {isAdmin
            ? 'You’re signed in as an organiser. Open your dashboard to manage events.'
            : isNew
              ? 'Your account is ready. Here’s how to book your first event.'
              : 'Here’s where you stand, and what to do next.'}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {actions.map(({ to, icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 100}>
              <Link
                to={to}
                className="group block h-full rounded-3xl border border-line bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-dark transition group-hover:bg-brand group-hover:text-white">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-4 flex items-center gap-2 text-xl font-bold tracking-tight">
                  {title}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </h2>
                <p className="mt-1 text-muted">{text}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Reveal>
            {nextTicket ? (
              <div className="h-full rounded-3xl bg-ink p-7 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-sun">Your next event</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{nextTicket.event.title}</h2>
                <p className="mt-2 text-white/70">
                  {formatDate(nextTicket.event.startsAt)} · {formatRange(nextTicket.event.startsAt, nextTicket.event.endsAt)}
                </p>
                <p className="text-white/70">{nextTicket.event.venue.name}</p>
                <Link
                  to="/my-registrations"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sun px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-white"
                >
                  View my ticket <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="h-full rounded-3xl bg-ink p-7 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-sun">Nothing booked yet</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Your next event starts here</h2>
                <p className="mt-2 text-white/70">
                  Pick an event, press Register, and your ticket will show up on this page.
                </p>
                <Link
                  to="/events"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sun px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-white"
                >
                  Browse events <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-3xl border border-line bg-card p-7">
              <h2 className="text-xl font-bold tracking-tight">Getting started</h2>
              <ul className="mt-4 space-y-3">
                {checklist.map((item) => {
                  const row = (
                    <span className="flex items-center gap-3 font-medium">
                      <span
                        className={`grid size-7 place-items-center rounded-full ${
                          item.done ? 'bg-emerald-600 text-white' : 'border-2 border-line'
                        }`}
                      >
                        {item.done && <Check size={15} aria-hidden="true" />}
                      </span>
                      <span className={item.done ? 'text-muted line-through' : ''}>{item.label}</span>
                    </span>
                  )
                  return (
                    <li key={item.label}>
                      {item.to && !item.done ? (
                        <Link to={item.to} className="hover:text-brand-dark">
                          {row}
                        </Link>
                      ) : (
                        row
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <UpcomingSection registered={registered} />
    </>
  )
}

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16" role="status" aria-label="Loading">
        <div className="h-72 animate-pulse rounded-[2.5rem] bg-line/60" />
      </div>
    )
  }

  return user ? <Dashboard user={user} /> : <Landing />
}