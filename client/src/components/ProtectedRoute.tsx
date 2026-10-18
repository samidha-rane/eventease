import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/auth'
import type { Role } from '@/types'

export default function ProtectedRoute({ role }: { role?: Role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-muted" role="status">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}