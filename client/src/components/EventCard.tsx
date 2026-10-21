import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, MapPin } from 'lucide-react'
import { dateParts, formatTime } from '@/lib/format'
import type { EventItem } from '@/types'

const tints = [
  'bg-brand-soft text-brand-dark',
  'bg-sun/50 text-ink',
  'bg-emerald-100 text-emerald-800',
  'bg-rose-100 text-rose-800',
  'bg-sky-100 text-sky-800',
]

export function tintFor(name: string) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return tints[sum % tints.length]
}

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

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative h-40 overflow-hidden">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt="" className="size-full object-cover" />
        ) : (
          <div
            className={`grid size-full place-items-center transition duration-300 group-hover:scale-105 ${tintFor(
              event.category.name,
            )}`}
          >
            <span className="font-display text-4xl font-extrabold opacity-40">
              {event.category.name}
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-2xl bg-card px-3 py-2 text-center shadow">
          <p className="font-display text-2xl font-extrabold leading-none">{day}</p>
          <p className="mt-0.5 text-xs font-bold uppercase text-muted">{month}</p>
        </div>

        {registered && (
          <span
            className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow ${
              registered === 'CONFIRMED'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 text-ink'
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
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
          {event.category.name}
        </p>
        <h3 className="mt-1 text-xl font-bold leading-snug tracking-tight">{event.title}</h3>

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