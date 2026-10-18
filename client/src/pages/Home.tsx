import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  LayoutDashboard,
  Search,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react'
import EventCard from '@/components/EventCard'
import { useAuth } from '@/hooks/auth'
import { useCategories, useEvents, useMyRegistrations } from '@/hooks/queries'
import { formatDate, formatRange } from '@/lib/format'
import { registrationMap } from '@/lib/registrations'
import { btnGhost, btnPrimary } from '@/lib/styles'
import type { User } from '@/types'

const steps = [
  {
    icon: UserPlus,
    title: 'Create a free account',
    text: 'Sign up with your email. It takes under a minute.',
  },
  {
    icon: Search,
    title: 'Find an event',
    text: 'Browse workshops, seminars, competitions and webinars, or search by name.',
  },
  {
    icon: CalendarCheck,
    title: 'Reserve your seat',
    text: 'Open an event and press Register. If it’s full you join the waitlist, and you move up when someone cancels.',
  },
  {
    icon: Ticket,
    title: 'Show up with your ticket',
    text: 'Every ticket is saved under My tickets, with a code you can show at the door.',
  },
]

function UpcomingSection({
  registered,
}: {
  registered: ReturnType<typeof registrationMap>
}) {
  const { data } = useEvents('when=upcoming&sort=startsAt&order=asc&limit=3')
  if (!data || data.events.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Coming up</h2>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline"
        >
          See all events <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.events.map((event) => (
          <EventCard key={event.id} event={event} registered={registered.get(event.id)} />
        ))}
      </div>
    </section>
  )
}

function Landing() {
  const categories = useCategories()

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-sun/60 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
            Now taking registrations
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
            Discover events. <span className="text-brand">Reserve your seat.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            EventEase is where colleges and organisations list their workshops, seminars,
            competitions and webinars. Browse what’s on, register in one click, and keep every
            ticket in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/events" className={`${btnPrimary} px-6 py-3`}>
              Browse events <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/register" className={`${btnGhost} px-6 py-3`}>
              Create free account
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-72 w-full max-w-sm" aria-hidden="true">
          <div className="absolute left-4 top-6 w-72 rotate-[-6deg] rounded-3xl border border-line bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">
                Admit one
              </span>
              <Ticket className="text-brand" size={22} />
            </div>
            <p className="mt-6 font-display text-2xl font-extrabold">Your seat</p>
            <p className="mt-1 text-sm text-muted">Confirmed and waiting for you</p>
            <div className="my-5 border-t-2 border-dashed border-line" />
            <div className="flex gap-1">
              {Array.from({ length: 28 }).map((_, index) => (
                <span
                  key={index}
                  className="h-8 w-0.5 bg-ink"
                  style={{ opacity: index % 3 === 0 ? 1 : 0.55 }}
                />
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 size-24 rotate-12 rounded-2xl bg-sun" />
          <div className="absolute bottom-0 right-6 size-16 rounded-full bg-brand" />
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">How it works</h2>
          <p className="mt-2 max-w-xl text-muted">Four simple steps from curious to checked in.</p>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="rounded-3xl border border-line bg-paper p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <span className="font-display text-3xl font-extrabold text-line">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="pt-20">
        <UpcomingSection registered={new Map()} />
      </div>

      {categories.data && categories.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Browse by category
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.data.map((category) => (
              <Link
                key={category.id}
                to={`/events?categoryId=${category.id}`}
                className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold transition hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-card p-8">
            <Users className="text-brand" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight">For participants</h2>
            <p className="mt-2 text-muted">
              Find events, register, join waitlists, manage your tickets, and leave feedback after
              you attend.
            </p>
          </div>
          <div className="rounded-3xl bg-ink p-8 text-white">
            <LayoutDashboard className="text-sun" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight">For organisers</h2>
            <p className="mt-2 text-white/70">
              Create events, manage venues and registrations, and watch sign-ups on a live
              dashboard.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-brand p-10 text-center text-white">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Ready to find your next event?
          </h2>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-dark transition hover:bg-sun hover:text-ink"
          >
            Create your free account <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
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
    {
      to: '/events',
      icon: Search,
      title: 'Browse events',
      text: 'See what’s coming up and pick one.',
    },
    {
      to: '/my-registrations',
      icon: Ticket,
      title: 'My tickets',
      text: `${upcomingTickets.length} upcoming ticket${upcomingTickets.length === 1 ? '' : 's'}`,
    },
    isAdmin
      ? {
          to: '/admin',
          icon: LayoutDashboard,
          title: 'Organiser dashboard',
          text: 'Manage events and see sign-ups.',
        }
      : {
          to: '/events?when=past',
          icon: CalendarCheck,
          title: 'Past events',
          text: 'Look back at what you’ve attended.',
        },
  ]

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12">
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Welcome back, <span className="text-brand">{firstName}</span>
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted">
          {isAdmin
            ? 'You’re signed in as an organiser. Open your dashboard to manage events.'
            : 'Here’s where you stand, and what to do next.'}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {actions.map(({ to, icon: Icon, title, text }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-3xl border border-line bg-card p-6 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h2 className="mt-4 flex items-center gap-2 text-lg font-bold tracking-tight">
                {title}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </h2>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {nextTicket ? (
            <div className="rounded-3xl bg-ink p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-sun">Your next event</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{nextTicket.event.title}</h2>
              <p className="mt-2 text-white/70">
                {formatDate(nextTicket.event.startsAt)} ·{' '}
                {formatRange(nextTicket.event.startsAt, nextTicket.event.endsAt)}
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
            <div className="rounded-3xl bg-ink p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-sun">Nothing booked yet</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Your next event starts here
              </h2>
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

          <div className="rounded-3xl border border-line bg-card p-7">
            <h2 className="text-lg font-bold tracking-tight">Getting started</h2>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => {
                const row = (
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span
                      className={`grid size-6 place-items-center rounded-full ${
                        item.done ? 'bg-emerald-600 text-white' : 'border-2 border-line'
                      }`}
                    >
                      {item.done && <Check size={14} aria-hidden="true" />}
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
        </div>
      </section>

      <div className="pt-6">
        <UpcomingSection registered={registered} />
      </div>
    </>
  )
}

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-muted" role="status">
        Loading…
      </div>
    )
  }

  return user ? <Dashboard user={user} /> : <Landing />
}