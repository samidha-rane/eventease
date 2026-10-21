import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import EventCard from '@/components/EventCard'
import Pagination from '@/components/Pagination'
import { useAuth } from '@/hooks/auth'
import Reveal from '@/components/Reveal'
import { useCategories, useEvents, useMyRegistrations } from '@/hooks/queries'
import { registrationMap } from '@/lib/registrations'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'

const PAGE_SIZE = 9

const tabs = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
]

const guide = [
  'Pick an event you like',
  'Open it and press Register',
  'Find your ticket under My tickets',
]

export default function Events() {
  const { user } = useAuth()
  const [sp, setSp] = useSearchParams()
  const categories = useCategories()
  const mine = useMyRegistrations(Boolean(user))
  const registered = registrationMap(mine.data)

  const q = sp.get('q') ?? ''
  const categoryId = sp.get('categoryId') ?? ''
  const when = sp.get('when') ?? 'upcoming'
  const page = Math.max(1, Number(sp.get('page')) || 1)
  const status = sp.get('status') ?? ''
  const from = sp.get('from') ?? ''
  const to = sp.get('to') ?? ''

  function chooseStatus(value: string) {
    const next = new URLSearchParams(sp)
    if (value) next.set('status', value)
    else next.delete('status')
    // Finished events are in the past, so show past ones too
    if (value === 'COMPLETED' && when === 'upcoming') next.set('when', 'all')
    next.delete('page')
    setSp(next)
  }

  const [text, setText] = useState(q)

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page') // a new filter starts again from page 1
    setSp(next)
  }

  function clearAll() {
    setText('')
    setSp(new URLSearchParams())
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setParam('q', text.trim())
  }

  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoryId) params.set('categoryId', categoryId)
  if (when === 'upcoming' || when === 'past') params.set('when', when)
  if (status) params.set('status', status)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  params.set('page', String(page))
  params.set('limit', String(PAGE_SIZE))
  params.set('sort', 'startsAt')
  params.set('order', when === 'past' ? 'desc' : 'asc')

  const { data, isPending, isError, isPlaceholderData } = useEvents(params.toString())
  const filtered = Boolean(q || categoryId || status || from || to || when !== 'upcoming')

  const chip = (active: boolean) =>
        `rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 ${
      active
        ? 'border-brand bg-brand text-white'
        : 'border-line bg-card text-ink hover:border-brand hover:text-brand-dark'
    }`

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Find an event</h1>
      <p className="mt-2 text-muted">Pick one, press Register, and your seat is saved.</p>

      {!(user && registered.size > 0) && (
        <ol className="mt-6 grid gap-3 rounded-3xl bg-brand-soft p-5 sm:grid-cols-3">
          {guide.map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
          {!user && (
            <li className="sm:col-span-3">
              <Link to="/register" className="text-sm font-bold text-brand-dark underline">
                Create a free account to register
              </Link>
            </li>
          )}
        </ol>
      )}

      <form onSubmit={submitSearch} className="mt-8 flex gap-2" role="search">
        <label htmlFor="search" className="sr-only">
          Search events
        </label>
        <input
          id="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search by title or description"
          className={inputCls}
        />
        <button type="submit" className={`${btnPrimary} shrink-0`}>
          <Search size={16} aria-hidden="true" /> Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Category">
        <button
          type="button"
          aria-pressed={categoryId === ''}
          className={chip(categoryId === '')}
          onClick={() => setParam('categoryId', '')}
        >
          All categories
        </button>
        {categories.data?.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={categoryId === category.id}
            className={chip(categoryId === category.id)}
            onClick={() => setParam('categoryId', category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-xl border border-line bg-card p-1"
          role="group"
          aria-label="When"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={when === tab.value}
              onClick={() => setParam('when', tab.value === 'upcoming' ? '' : tab.value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                when === tab.value ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-semibold text-brand-dark hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="from" className="mb-1 block text-sm font-semibold">
            From date
          </label>
          <input
            id="from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setParam('from', event.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-sm font-semibold">
            To date
          </label>
          <input
            id="to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setParam('to', event.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => chooseStatus(event.target.value)}
            className={inputCls}
          >
            <option value="">Any status</option>
            <option value="PUBLISHED">Open for registration</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="mt-8" aria-live="polite">
        {isPending && (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="status"
            aria-label="Loading events"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-3xl bg-line/60" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-line bg-card p-10 text-center">
            <h2 className="text-xl font-bold">We couldn’t load the events</h2>
            <p className="mt-2 text-muted">Check your filters or try again in a moment.</p>
            <button type="button" onClick={clearAll} className={`${btnGhost} mt-5`}>
              Reset filters
            </button>
          </div>
        )}

        {data && data.events.length === 0 && (
          <div className="rounded-3xl border border-line bg-card p-12 text-center">
            <SearchX className="mx-auto text-muted" size={36} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">
              {filtered ? 'No events match your search' : 'No upcoming events yet'}
            </h2>
            <p className="mt-2 text-muted">
              {filtered ? 'Try different words or clear the filters.' : 'Check back soon.'}
            </p>
            {filtered && (
              <button type="button" onClick={clearAll} className={`${btnGhost} mt-5`}>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {data && data.events.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted">
              {data.meta.total} event{data.meta.total === 1 ? '' : 's'}
            </p>
            <div
              className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
                isPlaceholderData ? 'opacity-60' : ''
              }`}
            >
                           {data.events.map((event, index) => (
                <Reveal key={event.id} delay={(index % 3) * 110} className="h-full">
                  <EventCard event={event} registered={registered.get(event.id)} />
                </Reveal>
              ))}
            </div>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onChange={(next) => setParam('page', String(next))}
            />
          </>
        )}
      </div>
    </div>
  )
}