import { Link } from 'react-router-dom'
import { btnPrimary } from '@/lib/styles'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold">We couldn’t find that page</h1>
      <Link to="/" className={`${btnPrimary} mt-8`}>
        Back to home
      </Link>
    </div>
  )
}