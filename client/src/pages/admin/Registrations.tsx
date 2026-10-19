import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Search } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import Pagination from '@/components/Pagination'
import StatusPill from '@/components/StatusPill'
import { useAdminRegistrations } from '@/hooks/adminQueries'
import { useEvents } from '@/hooks/queries'
import { api, ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'
import type { AdminRegistration, PageMeta } from '@/types'

// Stops spreadsheet programs from running text that starts with = + - or @ as a formula
function cell(value: string) {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export default function Registrations() {
  const queryClient = useQueryClient()
  const [sp, setSp] = useSearchParams()

  const q = sp.get('q') ?? ''
  const eventId = sp.get('eventId') ?? ''
  const status = sp.get('status') ?? ''
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const [text, setText] = useState(q)
  const [target, setTarget] = useState<AdminRegistration | null>(null)
  const [problem, setProblem] = useState('')
  const [exporting, setExporting] = useState(false)

  const events = useEvents('limit=50&sort=startsAt&order=desc')

  const filters = new URLSearchParams()
  if (q) filters.set('q', q)
  if (eventId) filters.set('eventId', eventId)
  if (status) filters.set('status', status)

  const params = new URLSearchParams(filters)
  params.set('page', String(page))
  params.set('limit', '15')

  const { data, isPending, isError } = useAdminRegistrations(params.toString())

  const cancel = useMutation({
    mutationFn: (id: string) => api(`/registrations/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      setProblem('')
      setTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
    onError: (error) => {
      setTarget(null)
      setProblem(error instanceof ApiError ? error.message : 'Something went wrong')
    },
  })

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSp(next)
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setParam('q', text.trim())
  }

  async function exportCsv() {
    setExporting(true)
    setProblem('')
    try {
      const rows: AdminRegistration[] = []
      let current = 1
      let totalPages = 1

      do {
        const batch = new URLSearchParams(filters)
        batch.set('page', String(current))
        batch.set('limit', '100')
        const result = await api<{ registrations: AdminRegistration[]; meta: PageMeta }>(
          `/registrations?${batch.toString()}`,
        )
        rows.push(...result.registrations)
        totalPages = result.meta.totalPages
        current += 1
      } while (current <= totalPages && current <= 50)

      const header = ['Name', 'Email', 'Phone', 'Event', 'Event date', 'Status', 'Registered', 'Ticket']
      const lines = rows.map((row) =>
        [
          row.user.name,
          row.user.email,
          row.user.phone ?? '',
          row.event.title,
          formatDate(row.event.startsAt),
          row.status,
          formatDate(row.registeredAt),
          row.ticketCode.slice(0, 8).toUpperCase(),
        ]
          .map(cell)
          .join(','),
      )

      const csv = '\uFEFF' + [header.map(cell).join(','), ...lines].join('\r\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'registrations.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setProblem('The export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const smallDanger =
    'rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Registrations</h1>
          <p className="mt-1 text-muted">Everyone who signed up, across all events.</p>
        </div>
        <button type="button" className={btnGhost} onClick={exportCsv} disabled={exporting}>
          <Download size={16} aria-hidden="true" /> {exporting ? 'Preparing…' : 'Export CSV'}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <form onSubmit={submitSearch} className="flex flex-1 gap-2" role="search">
          <label htmlFor="q" className="sr-only">
            Search by name or email
          </label>
          <input
            id="q"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Search by name or email"
            className={inputCls}
          />
          <button type="submit" className={`${btnPrimary} shrink-0`}>
            <Search size={16} aria-hidden="true" /> Search
          </button>
        </form>

        <label htmlFor="event" className="sr-only">
          Event
        </label>
        <select
          id="event"
          value={eventId}
          onChange={(event) => setParam('eventId', event.target.value)}
          className={`${inputCls} lg:max-w-xs`}
        >
          <option value="">All events</option>
          {events.data?.events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <label htmlFor="status" className="sr-only">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(event) => setParam('status', event.target.value)}
          className={`${inputCls} lg:max-w-[11rem]`}
        >
          <option value="">Any status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {problem && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
        {isPending && <div className="h-48 animate-pulse bg-line/40" role="status" aria-label="Loading registrations" />}
        {isError && <p className="p-8 text-center text-muted">We couldn’t load the registrations.</p>}
        {data && data.registrations.length === 0 && (
          <p className="p-10 text-center text-muted">No registrations match these filters.</p>
        )}

        {data && data.registrations.length > 0 && (
          <table className="w-full min-w-[46rem] text-left text-sm">
            <caption className="sr-only">Registrations</caption>
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">Participant</th>
                <th scope="col" className="px-5 py-3">Event</th>
                <th scope="col" className="px-5 py-3">Registered</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.registrations.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{row.user.name}</p>
                    <p className="text-xs text-muted">{row.user.email}</p>
                  </td>
                  <td className="px-5 py-4">{row.event.title}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{formatDate(row.registeredAt)}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {row.status !== 'CANCELLED' && (
                      <button type="button" className={smallDanger} onClick={() => setTarget(row)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <>
          <p className="mt-3 text-sm text-muted">
            {data.meta.total} registration{data.meta.total === 1 ? '' : 's'}
          </p>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(next) => setParam('page', String(next))}
          />
        </>
      )}

      <ConfirmDialog
        open={target !== null}
        title="Cancel this registration?"
        message={
          target
            ? `${target.user.name}’s place at “${target.event.title}” will be cancelled. If anyone is on the waitlist, the next person is confirmed automatically.`
            : ''
        }
        confirmLabel="Yes, cancel it"
        busy={cancel.isPending}
        onConfirm={() => target && cancel.mutate(target.id)}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}