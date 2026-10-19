import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Pagination from '@/components/Pagination'
import StatusPill from '@/components/StatusPill'
import { useParticipant, useParticipants } from '@/hooks/adminQueries'
import { formatDate } from '@/lib/format'
import { btnPrimary, inputCls } from '@/lib/styles'

function Detail({ id }: { id: string }) {
  const { data, isPending, isError } = useParticipant(id)

  if (isPending) return <p className="text-sm text-muted">Loading profile…</p>
  if (isError || !data) return <p className="text-sm text-red-700">We couldn’t load this profile.</p>

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="text-sm font-bold">Registrations ({data.registrations.length})</h3>
        {data.registrations.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No registrations yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {data.registrations.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {item.event.title}
                  <span className="block text-xs text-muted">{formatDate(item.event.startsAt)}</span>
                </span>
                <StatusPill status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold">Feedback given ({data.feedback.length})</h3>
        {data.feedback.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No feedback yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {data.feedback.map((item) => (
              <li key={item.id}>
                <span aria-label={`${item.rating} out of 5`} className="text-amber-500">
                  {'★'.repeat(item.rating)}
                  <span className="text-line">{'★'.repeat(5 - item.rating)}</span>
                </span>{' '}
                {item.event.title}
                {item.comment && <p className="text-muted">“{item.comment}”</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function Participants() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const [text, setText] = useState(q)
  const [openId, setOpenId] = useState<string | null>(null)

  const params = new URLSearchParams()
  if (q) params.set('q', q)
  params.set('page', String(page))
  params.set('limit', '15')

  const { data, isPending, isError } = useParticipants(params.toString())

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setOpenId(null)
    setSp(next)
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setParam('q', text.trim())
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Participants</h1>
      <p className="mt-1 text-muted">Everyone who has signed up. Open a row to see their history.</p>

      <form onSubmit={submitSearch} className="mt-6 flex max-w-xl gap-2" role="search">
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

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
        {isPending && <div className="h-48 animate-pulse bg-line/40" role="status" aria-label="Loading participants" />}
        {isError && <p className="p-8 text-center text-muted">We couldn’t load the participants.</p>}
        {data && data.participants.length === 0 && (
          <p className="p-10 text-center text-muted">No participants match your search.</p>
        )}

        {data && data.participants.length > 0 && (
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Participants</caption>
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">Name</th>
                <th scope="col" className="px-5 py-3">Email</th>
                <th scope="col" className="px-5 py-3">Phone</th>
                <th scope="col" className="px-5 py-3">Joined</th>
                <th scope="col" className="px-5 py-3">Registrations</th>
                <th scope="col" className="px-5 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody>
              {data.participants.map((person) => {
                const open = openId === person.id
                return (
                  <FragmentRow key={person.id} open={open}>
                    <tr className="border-b border-line">
                      <th scope="row" className="px-5 py-4 font-semibold">{person.name}</th>
                      <td className="px-5 py-4">{person.email}</td>
                      <td className="px-5 py-4">{person.phone ?? '—'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{formatDate(person.createdAt)}</td>
                      <td className="px-5 py-4">{person._count.registrations}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          aria-expanded={open}
                          className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-ink"
                          onClick={() => setOpenId(open ? null : person.id)}
                        >
                          {open ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b border-line bg-paper">
                        <td colSpan={6} className="px-5 py-5">
                          <Detail id={person.id} />
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <>
          <p className="mt-3 text-sm text-muted">
            {data.meta.total} participant{data.meta.total === 1 ? '' : 's'}
          </p>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(next) => setParam('page', String(next))}
          />
        </>
      )}
    </div>
  )
}

// Lets one participant produce two table rows without an extra wrapper element
function FragmentRow({ children }: { open: boolean; children: React.ReactNode }) {
  return <>{children}</>
}