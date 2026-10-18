import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${
        light ? 'text-white' : 'text-ink'
      }`}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">
        <Ticket size={18} aria-hidden="true" />
      </span>
      EventEase
    </Link>
  )
}