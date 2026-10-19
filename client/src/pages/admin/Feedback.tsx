import { useSearchParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import Pagination from '@/components/Pagination'
import { useFeedback } from '@/hooks/adminQueries'
import { useEvents } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { inputCls } from '@/lib/styles'

export default function Feedback() {
  const [sp, setSp] = useSearchParams()
  const eventId = sp.get('eventId') ?? ''
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const events = useEvents('limit=50&sort=startsAt&order=desc')

  const params = new URLSearchParams()
  if (eventId) params.set('eventId', eventId)
  params.set('page', String(page))
  params.set('limit', '10')

  const { data, isPending, isError } = useFeedback(params.toString())

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSp(next)
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Feedback</h1>
      <p className="mt-1 text-muted">What attendees said after your events.</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="min-w-0 max-w-sm flex-1">
          <label htmlFor="event" className="sr-only">
            Event
          </label>
          <select
            id="event"
            value={eventId}
            onChange={(event) => setParam('eventId', event.target.value)}
            className={inputCls}
          >
            <option value="">All events</option>
            {events.data?.events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {data && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-sun/50 px-4 py-2 text-sm font-bold">
            <Star size={16} aria-hidden="true" />
            {data.averageRating === null ? 'No ratings yet' : `${data.averageRating} average`}
            <span className="font-medium text-ink/70">
              · {data.meta.total} review{data.meta.total === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {isPending && <div className="h-32 animate-pulse rounded-3xl bg-line/60" role="status" aria-label="Loading feedback" />}
        {isError && (
          <p className="rounded-3xl border border-line bg-card p-8 text-center text-muted">
            We couldn’t load the feedback.
          </p>
        )}
        {data && data.feedback.length === 0 && (
          <p className="rounded-3xl border border-line bg-card p-10 text-center text-muted">
            No feedback yet. Ratings appear here after attendees review an event that has ended.
          </p>
        )}

        {data?.feedback.map((item) => (
          <article key={item.id} className="rounded-3xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{item.event.title}</p>
              <span className="text-xl text-amber-500" role="img" aria-label={`${item.rating} out of 5 stars`}>
                {'★'.repeat(item.rating)}
                <span className="text-line">{'★'.repeat(5 - item.rating)}</span>
              </span>
            </div>
            {item.comment ? (
              <p className="mt-2 text-muted">“{item.comment}”</p>
            ) : (
              <p className="mt-2 text-sm text-muted">No comment left.</p>
            )}
            <p className="mt-3 text-xs text-muted">
              {item.user.name} · {formatDate(item.createdAt)}
            </p>
          </article>
        ))}
      </div>

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onChange={(next) => setParam('page', String(next))}
        />
      )}
    </div>
  )
}