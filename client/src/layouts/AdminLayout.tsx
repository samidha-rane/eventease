import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/events', label: 'Events', end: false },
  { to: '/admin/registrations', label: 'Registrations', end: false },
  { to: '/admin/participants', label: 'Participants', end: false },
  { to: '/admin/feedback', label: 'Feedback', end: false },
  { to: '/admin/venues', label: 'Venues', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
]

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">Organiser area</p>

      <nav
        className="mt-3 flex gap-1 overflow-x-auto border-b border-line"
        aria-label="Organiser"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'border-brand text-brand-dark'
                  : 'border-transparent text-muted hover:text-ink'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  )
}