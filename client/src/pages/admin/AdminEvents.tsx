import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import EventFormDialog from '@/components/EventFormDialog'
import Pagination from '@/components/Pagination'
import StatusPill from '@/components/StatusPill'
import { useEvents } from '@/hooks/queries'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatTime } from '@/lib/format'
import { btnPrimary, inputCls } from '@/lib/styles'
import type { EventItem } from '@/types'

type Pending = { event: EventItem; action: 'cancel' | 'delete' }

const small =
  'rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-ink disabled:opacity-50'
const smallDanger =
  'rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50'

export default function AdminEvents() {
  const queryClient = useQueryClient()
  const [sp, setSp] = useSearchParams()

  const status = sp.get('status') ?? ''
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const [formOpen, setFormOpen] = useState(sp.get('new') === '1')
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [problem, setProblem] = useState('')

  const params = new URLSearchParams()
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('limit', '10')
  params.set('sort', 'startsAt')
  params.set('order', 'desc')

  const { data, isPending, isError } = useEvents(params.toString())

  const run = useMutation({
    mutationFn: ({ event, action }: { event: EventItem; action: string }) =>
      action === 'delete'
        ? api(`/events/${event.id}`, { method: 'DELETE' })
        : api(`/events/${event.id}/${action}`, { method: 'POST' }),
    onSuccess: () => {
      setProblem('')
      setPending(null)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
    },
    onError: (error) => {
      setPending(null)
      setProblem(error instanceof ApiError ? error.message : 'Something went wrong')
    },
  })

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp)
    next.delete('new')
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSp(next)
  }

  function openForm(event: EventItem | null) {
    setEditing(event)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    if (sp.get('new')) {
      const next = new URLSearchParams(sp)
      next.delete('new')
      setSp(next, { replace: true })
    }
  }

  const now = Date.now()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Events</h1>
          <p className="mt-1 text-muted">Create, publish and manage every event.</p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => openForm(null)}>
          <Plus size={16} aria-hidden="true" /> Create event
        </button>
      </div>

      <div className="mt-6 max-w-xs">
        <label htmlFor="status" className="sr-only">
          Filter by status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
          className={inputCls}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Drafts</option>
          <option value="PUBLISHED">Published</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {problem && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
        {isPending && <div className="h-48 animate-pulse bg-line/40" role="status" aria-label="Loading events" />}

        {isError && <p className="p-8 text-center text-muted">We couldn’t load the events.</p>}

        {data && data.events.length === 0 && (
          <p className="p-10 text-center text-muted">
            No events here yet. Use <strong>Create event</strong> to add one.
          </p>
        )}

        {data && data.events.length > 0 && (
          <table className="w-full min-w-[52rem] text-left text-sm">
            <caption className="sr-only">All events</caption>
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">Event</th>
                <th scope="col" className="px-5 py-3">When</th>
                <th scope="col" className="px-5 py-3">Venue</th>
                <th scope="col" className="px-5 py-3">Seats</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((event) => {
                const ended = new Date(event.endsAt).getTime() < now
                return (
                  <tr key={event.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4">
                      <Link to={`/events/${event.id}`} className="font-semibold hover:text-brand-dark">
                        {event.title}
                      </Link>
                      <p className="text-xs text-muted">{event.category.name}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(event.startsAt)}
                      <p className="text-xs text-muted">{formatTime(event.startsAt)}</p>
                    </td>
                    <td className="px-5 py-4">{event.venue.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {event.registeredCount} / {event.capacity}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={event.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                          <button type="button" className={small} onClick={() => openForm(event)}>
                            Edit
                          </button>
                        )}
                        {event.status === 'DRAFT' && (
                          <button
                            type="button"
                            className={small}
                            disabled={run.isPending}
                            onClick={() => run.mutate({ event, action: 'publish' })}
                          >
                            Publish
                          </button>
                        )}
                        {event.status === 'PUBLISHED' && ended && (
                          <button
                            type="button"
                            className={small}
                            disabled={run.isPending}
                            onClick={() => run.mutate({ event, action: 'complete' })}
                          >
                            Mark done
                          </button>
                        )}
                        {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                          <button
                            type="button"
                            className={smallDanger}
                            onClick={() => setPending({ event, action: 'cancel' })}
                          >
                            Cancel
                          </button>
                        )}
                        {event.status === 'DRAFT' && (
                          <button
                            type="button"
                            className={smallDanger}
                            onClick={() => setPending({ event, action: 'delete' })}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onChange={(next) => setParam('page', String(next))}
        />
      )}

      <EventFormDialog open={formOpen} event={editing} onClose={closeForm} />

      <ConfirmDialog
        open={pending !== null}
        title={pending?.action === 'delete' ? 'Delete this draft?' : 'Cancel this event?'}
        message={
          pending
            ? pending.action === 'delete'
              ? `“${pending.event.title}” will be removed for good.`
              : `“${pending.event.title}” will be cancelled and every registration on it will be cancelled too. This can’t be undone.`
            : ''
        }
        confirmLabel={pending?.action === 'delete' ? 'Yes, delete it' : 'Yes, cancel event'}
        busy={run.isPending}
        onConfirm={() => pending && run.mutate({ event: pending.event, action: pending.action })}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}