import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useIsFetching } from '@tanstack/react-query'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/auth'
import ScrollProgress from '@/components/ScrollProgress'
import { btnGhost, btnPrimary } from '@/lib/styles'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-brand-soft text-brand-dark' : 'text-muted hover:text-ink'
  }`

export default function PublicLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // If something has been loading for a few seconds, tell the visitor why
  const fetching = useIsFetching()
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!fetching) {
      setSlow(false)
      return
    }
    const timer = setTimeout(() => setSlow(true), 3500)
    return () => clearTimeout(timer)
  }, [fetching])

  const links = [
    { to: '/events', label: 'Events' },
    { to: '/how-it-works', label: 'How it works' },
        ...(user
      ? [
          { to: '/my-registrations', label: 'My tickets' },
          { to: '/profile', label: 'Profile' },
        ]
      : []),
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ]
  async function handleLogout() {
    try {
      await logout()
    } catch {
      // The screen has already switched to logged-out
    }
    setOpen(false)
    navigate('/')
  }

  return (
        <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      {slow && (
        <div
          role="status"
          className="bg-ink px-4 py-2 text-center text-sm font-medium text-white"
        >
          Starting the server, just a moment. This only happens after a quiet spell.
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-lg">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="mr-2 text-sm text-muted">Hi, {user.name.split(' ')[0]}</span>
                <button type="button" onClick={handleLogout} className={btnGhost}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={btnGhost}>
                  Log in
                </Link>
                <Link to="/register" className={btnPrimary}>
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-line md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="animate-page border-t border-line bg-paper px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 flex gap-2">
              {user ? (
                <button type="button" onClick={handleLogout} className={`${btnGhost} w-full`}>
                  Log out
                </button>
              ) : (
                <>
                  <Link to="/login" className={`${btnGhost} flex-1`} onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className={`${btnPrimary} flex-1`}
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div key={location.pathname} className="animate-page">
          <Outlet />
        </div>
      </main>

      <footer className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-white/60">
              Find events, reserve your seat, and keep every ticket in one place. Made for colleges
              and organisations.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Explore</h2>
            <ul className="mt-3 space-y-2 text-white/70">
              <li><Link to="/events" className="hover:text-sun">Events</Link></li>
              <li><Link to="/how-it-works" className="hover:text-sun">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Account</h2>
            <ul className="mt-3 space-y-2 text-white/70">
              <li><Link to="/login" className="hover:text-sun">Log in</Link></li>
              <li><Link to="/register" className="hover:text-sun">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-sm text-white/50">
          © EventEase. Events made easy.
        </div>
      </footer>
    </div>
  )
}