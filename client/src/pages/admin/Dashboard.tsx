import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarDays, Plus, Star, Ticket, Users } from 'lucide-react'
import StatusPill from '@/components/StatusPill'
import { useOverview } from '@/hooks/adminQueries'
import { formatDate } from '@/lib/format'
import { btnPrimary } from '@/lib/styles'

const COLORS = ['#5a3df0', '#ffcf4a', '#10b981', '#f43f5e', '#0ea5e9', '#f97316']

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export default function Dashboard() {
  const { data, isPending, isError } = useOverview()

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading dashboard">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-3xl bg-line/60" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="rounded-3xl border border-line bg-card p-8 text-center text-muted">
        We couldn’t load the dashboard. Please refresh the page.
      </p>
    )
  }

  const stats = [
    { icon: CalendarDays, label: 'Total events', value: data.totals.events, hero: true },
    { icon: Users, label: 'Participants', value: data.totals.participants },
    { icon: Ticket, label: 'Active registrations', value: data.totals.registrations },
    { icon: CalendarDays, label: 'Upcoming events', value: data.totals.upcomingEvents },
  ]

  const categories = data.categoryBreakdown.filter((item) => item.events > 0)
  const totalInWindow = data.registrationsOverTime.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted">A live look at your events and sign-ups.</p>
        </div>
        <Link to="/admin/events?new=1" className={btnPrimary}>
          <Plus size={16} aria-hidden="true" /> Create event
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, hero }) => (
          <div
            key={label}
            className={`rounded-3xl border p-6 ${
              hero ? 'border-brand bg-brand text-white' : 'border-line bg-card'
            }`}
          >
            <Icon size={20} className={hero ? 'text-sun' : 'text-brand'} aria-hidden="true" />
            <p className="mt-3 font-display text-4xl font-extrabold">{value}</p>
            <p className={`text-sm ${hero ? 'text-white/80' : 'text-muted'}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-line bg-card p-6">
          <h2 className="text-lg font-bold tracking-tight">Registrations, last 30 days</h2>
          <p className="text-sm text-muted">
            {totalInWindow} new registration{totalInWindow === 1 ? '' : 's'} in this period
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.registrationsOverTime} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a3df0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#5a3df0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e6e1d6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip labelFormatter={(label) => shortDate(String(label))} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke="#5a3df0"
                  strokeWidth={2.5}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-card p-6">
          <h2 className="text-lg font-bold tracking-tight">Events by category</h2>
          {categories.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No events yet.</p>
          ) : (
            <>
              <div className="mt-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="events"
                      nameKey="name"
                      innerRadius={44}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {categories.map((item, index) => (
                        <Cell key={item.id} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {categories.map((item, index) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: COLORS[index % COLORS.length] }}
                        aria-hidden="true"
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold">{item.events}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-card p-6">
          <h2 className="text-lg font-bold tracking-tight">Upcoming events</h2>
          {data.upcomingEvents.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No upcoming events. Create one to get started.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {data.upcomingEvents.map((event) => {
                const filled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
                return (
                  <li key={event.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <Link to={`/events/${event.id}`} className="font-semibold hover:text-brand-dark">
                        {event.title}
                      </Link>
                      <span className="shrink-0 text-muted">{formatDate(event.startsAt)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${filled}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {event.registeredCount} of {event.capacity} seats · {event.venue.name}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Recent registrations</h2>
            {data.feedback.averageRating !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sun/50 px-3 py-1 text-xs font-bold">
                <Star size={13} aria-hidden="true" /> {data.feedback.averageRating} avg rating
              </span>
            )}
          </div>
          {data.recentRegistrations.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No registrations yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {data.recentRegistrations.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.user.name}</p>
                    <p className="truncate text-muted">{item.event.title}</p>
                  </div>
                  <StatusPill status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}