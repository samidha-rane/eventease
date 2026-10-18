import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/auth'
import { btnGhost, btnPrimary } from '@/lib/styles'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-soft text-brand-dark' : 'text-muted hover:text-ink'
  }`

export default function PublicLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

    const links = [
    { to: '/events', label: 'Events' },
    { to: '/how-it-works', label: 'How it works' },
    ...(user ? [{ to: '/my-registrations', label: 'My tickets' }] : []),
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ]

  async function handleLogout() {
    await logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
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
            className="grid size-10 place-items-center rounded-lg border border-line md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-paper px-4 py-4 md:hidden">
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
        <Outlet />
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        © EventEase. Events made easy.
      </footer>
    </div>
  )
}