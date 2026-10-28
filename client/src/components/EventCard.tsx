import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, MapPin } from 'lucide-react'
import { eventImage } from '@/lib/images'
import { dateParts, formatTime } from '@/lib/format'
import type { EventItem } from '@/types'

function seatsLabel(event: EventItem) {
  if (event.status === 'COMPLETED') return 'Event finished'
  if (event.seatsLeft === 0) return 'Full, waitlist open'
  return `${event.seatsLeft} seat${event.seatsLeft === 1 ? '' : 's'} left`
}

type Props = {
  event: EventItem
  registered?: 'CONFIRMED' | 'WAITLISTED'
}

export default function EventCard({ event, registered }: Props) {
  const { day, month } = dateParts(event.startsAt)
  const filled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
  const photo = eventImage(event)

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative h-44 overflow-hidden bg-ink">
                <img
          src={photo.src}
          alt=""
          loading="lazy"
          style={{ objectPosition: photo.position }}
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent"
        />

        <div className="absolute left-4 top-4 rounded-2xl bg-card px-3 py-2 text-center shadow">
          <p className="font-display text-2xl font-extrabold leading-none">{day}</p>
          <p className="mt-0.5 text-xs font-bold uppercase text-muted">{month}</p>
        </div>

        {registered && (
          <span
            className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow ${
              registered === 'CONFIRMED' ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-ink'
            }`}
          >
            {registered === 'CONFIRMED' ? (
              <>
                <Check size={13} aria-hidden="true" /> You’re going
              </>
            ) : (
              <>
                <Clock size={13} aria-hidden="true" /> On waitlist
              </>
            )}
          </span>
        )}

        <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
          {event.category.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold leading-snug tracking-tight">{event.title}</h3>

        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <MapPin size={15} aria-hidden="true" />
          {event.venue.name} · {formatTime(event.startsAt)}
        </p>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted">
            <span>{seatsLabel(event)}</span>
            <span>{filled}% full</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className={`animate-grow h-full rounded-full transition-all ${
                filled >= 90 ? 'bg-amber-500' : 'bg-brand'
              }`}
              style={{ width: `${filled}%` }}
            />
          </div>
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
          View details
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  )
}