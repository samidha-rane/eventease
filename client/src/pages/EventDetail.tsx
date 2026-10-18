import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import StatusPill from '@/components/StatusPill'
import { tintFor } from '@/components/EventCard'
import { useAuth } from '@/hooks/auth'
import { useEvent, useMyRegistrations } from '@/hooks/queries'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatRange } from '@/lib/format'
import { btnGhost, btnPrimary } from '@/lib/styles'
import type { Registration } from '@/types'

export default function EventDetail() {
  const { id } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: event, isPending, error } = useEvent(id)
  const myRegistrations = useMyRegistrations(Boolean(user))
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState('')

  const register = useMutation({
    mutationFn: () => api<{ registration: Registration }>(`/events/${id}/register`, { method: 'POST' }),
    onSuccess: (data) => {
      setProblem('')
      setNotice(
        data.registration.status === 'CONFIRMED'
          ? 'You’re in! Your seat is confirmed.'
          : 'This event is full, so you’re on the waitlist. We’ll confirm you if a seat opens.',
      )
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
    },
    onError: (err) => {
      setNotice('')
      setProblem(err instanceof ApiError ? err.message : 'Something went wrong')
    },
  })

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12" role="status" aria-label="Loading event">
        <div className="h-72 animate-pulse rounded-3xl bg-line/60" />
      </div>
    )
  }

  if (error || !event) {
    const missing = error instanceof ApiError && error.status === 404
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold">
          {missing ? 'We couldn’t find that event' : 'We couldn’t load this event'}
        </h1>
        <Link to="/events" className={`${btnPrimary} mt-8`}>
          Browse events
        </Link>
      </div>
    )
  }

  const mine = myRegistrations.data?.find(
    (item) => item.event.id === event.id && item.status !== 'CANCELLED',
  )
  const now = Date.now()
  const closed =
    event.status !== 'PUBLISHED' ||
    now > new Date(event.registrationDeadline).getTime() ||
    now >= new Date(event.startsAt).getTime()
  const full = event.seatsLeft === 0

  let action
  if (mine) {
    action = (
      <div className="rounded-2xl bg-brand-soft p-4 text-sm">
        <StatusPill status={mine.status} />
        <p className="mt-2">
          {mine.status === 'CONFIRMED'
            ? 'You’re registered for this event.'
            : 'You’re on the waitlist for this event.'}
        </p>
        <Link to="/my-registrations" className="mt-2 inline-block font-semibold text-brand-dark hover:underline">
          View my ticket
        </Link>
      </div>
    )
  } else if (closed) {
    action = (
      <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
        Registration is closed for this event.
      </p>
    )
  } else if (!user) {
    action = (
      <Link to="/login" state={{ from: location.pathname }} className={`${btnPrimary} w-full py-3`}>
        Log in to register
      </Link>
    )
  } else {
    action = (
      <button
        type="button"
        className={`${btnPrimary} w-full py-3`}
        disabled={register.isPending}
        onClick={() => register.mutate()}
      >
        {register.isPending ? 'Please wait…' : full ? 'Join the waitlist' : 'Register now'}
      </button>
    )
  }

  const info = [
    { icon: CalendarDays, label: formatDate(event.startsAt) },
    { icon: Clock, label: formatRange(event.startsAt, event.endsAt) },
    { icon: MapPin, label: `${event.venue.name}, ${event.venue.address}` },
    {
      icon: Users,
      label: full ? 'Full, waitlist open' : `${event.seatsLeft} of ${event.capacity} seats left`,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/events" className={`${btnGhost} mb-6`}>
        <ArrowLeft size={16} aria-hidden="true" /> All events
      </Link>

      <div className="overflow-hidden rounded-3xl border border-line bg-card">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt="" className="h-56 w-full object-cover md:h-72" />
        ) : (
          <div className={`grid h-56 place-items-center md:h-72 ${tintFor(event.category.name)}`}>
            <span className="font-display text-6xl font-extrabold opacity-30 md:text-8xl">
              {event.category.name}
            </span>
          </div>
        )}

        <div className="grid gap-10 p-6 md:grid-cols-[1.5fr_1fr] md:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">
                {event.category.name}
              </span>
              <StatusPill status={event.status} />
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">
              {event.title}
            </h1>
            <h2 className="mt-8 text-lg font-bold">About this event</h2>
            <p className="mt-2 whitespace-pre-line text-muted">{event.description}</p>
          </div>

          <aside className="h-fit space-y-5 rounded-3xl border border-line bg-paper p-6 md:sticky md:top-24">
            <ul className="space-y-3 text-sm">
              {info.map(({ icon: Icon, label }) => (
                <li key={label} className="flex gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">
              Register before {formatDate(event.registrationDeadline)}
            </p>

            {action}

            <div aria-live="polite">
              {notice && (
                <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {notice}
                </p>
              )}
              {problem && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {problem}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}