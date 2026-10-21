import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Ticket } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import RateDialog from '@/components/RateDialog'
import StatusPill from '@/components/StatusPill'
import { useMyFeedback, useMyRegistrations } from '@/hooks/queries'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatRange } from '@/lib/format'
import { btnDanger, btnGhost, btnPrimary } from '@/lib/styles'
import type { Registration } from '@/types'

type Props = {
  registration: Registration
  onCancel?: () => void
  onRate?: () => void
  rated?: number
}

function TicketCard({ registration, onCancel, onRate, rated }: Props) {
  const { event } = registration
  const muted = registration.status === 'CANCELLED'

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border border-line bg-card sm:flex-row ${
        muted ? 'opacity-70' : ''
      }`}
    >
      <div className="flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={registration.status} />
          {registration.checkedInAt && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Checked in
            </span>
          )}
          <span className="text-xs text-muted">Registered {formatDate(registration.registeredAt)}</span>
        </div>
        <h3 className="mt-3 text-xl font-bold tracking-tight">
          <Link to={`/events/${event.id}`} className="hover:text-brand-dark hover:underline">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted">
          {formatDate(event.startsAt)} · {formatRange(event.startsAt, event.endsAt)}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted">
          <MapPin size={15} aria-hidden="true" />
          {event.venue.name}, {event.venue.address}
        </p>
      </div>

      <div className="flex flex-row items-center justify-between gap-4 border-t-2 border-dashed border-line bg-paper p-6 sm:w-60 sm:flex-col sm:justify-center sm:border-l-2 sm:border-t-0">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Ticket</p>
          <p className="mt-1 font-mono text-lg font-bold tracking-widest">
            {registration.ticketCode.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {onCancel && (
          <button type="button" className={`${btnDanger} px-4 py-2`} onClick={onCancel}>
            Cancel
          </button>
        )}

        {rated !== undefined ? (
          <p className="text-center text-sm font-semibold text-amber-600">
            You rated it
            <span className="block text-lg" aria-label={`${rated} out of 5 stars`}>
              {'★'.repeat(rated)}
            </span>
          </p>
        ) : (
          onRate && (
            <button type="button" className={`${btnGhost} px-4 py-2`} onClick={onRate}>
              Rate this event
            </button>
          )
        )}
      </div>
    </article>
  )
}

export default function MyRegistrations() {
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useMyRegistrations(true)
  const feedback = useMyFeedback(true)
  const [target, setTarget] = useState<Registration | null>(null)
  const [rateTarget, setRateTarget] = useState<{ id: string; title: string } | null>(null)
  const [problem, setProblem] = useState('')

  const ratedMap = new Map((feedback.data ?? []).map((item) => [item.eventId, item.rating]))

  const cancel = useMutation({
    mutationFn: (id: string) =>
      api<{ registration: Registration }>(`/registrations/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      setTarget(null)
      setProblem('')
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
    onError: (err) => {
      setTarget(null)
      setProblem(err instanceof ApiError ? err.message : 'Something went wrong')
    },
  })

  const now = Date.now()
  const upcoming = (data ?? []).filter(
    (item) => item.status !== 'CANCELLED' && new Date(item.event.endsAt).getTime() > now,
  )
  const history = (data ?? []).filter((item) => !upcoming.includes(item))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">My tickets</h1>
      <p className="mt-2 text-muted">Everything you’ve registered for, in one place.</p>

      {problem && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      {isPending && (
        <div className="mt-8 space-y-4" role="status" aria-label="Loading tickets">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-line/60" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-8 rounded-3xl border border-line bg-card p-8 text-center text-muted">
          We couldn’t load your tickets. Please refresh the page.
        </p>
      )}

      {data && data.length === 0 && (
        <div className="mt-8 rounded-3xl border border-line bg-card p-12 text-center">
          <Ticket className="mx-auto text-muted" size={36} aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">No tickets yet</h2>
          <p className="mt-2 text-muted">Find an event you like and register in one click.</p>
          <Link to="/events" className={`${btnPrimary} mt-6`}>
            Browse events
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">Upcoming</h2>
          <div className="space-y-4">
            {upcoming.map((item) => (
              <TicketCard key={item.id} registration={item} onCancel={() => setTarget(item)} />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">History</h2>
          <div className="space-y-4">
            {history.map((item) => {
              const ended = new Date(item.event.endsAt).getTime() <= now
              const canRate =
                item.status === 'CONFIRMED' && ended && item.event.status !== 'CANCELLED'
              return (
                <TicketCard
                  key={item.id}
                  registration={item}
                  rated={canRate ? ratedMap.get(item.event.id) : undefined}
                  onRate={
                    canRate
                      ? () => setRateTarget({ id: item.event.id, title: item.event.title })
                      : undefined
                  }
                />
              )
            })}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={target !== null}
        title="Cancel this registration?"
        message={
          target
            ? `You’ll give up your place at “${target.event.title}”. If there’s a waitlist, the next person gets your seat.`
            : ''
        }
        confirmLabel="Yes, cancel it"
        busy={cancel.isPending}
        onConfirm={() => target && cancel.mutate(target.id)}
        onCancel={() => setTarget(null)}
      />

      <RateDialog event={rateTarget} onClose={() => setRateTarget(null)} />
    </div>
  )
}