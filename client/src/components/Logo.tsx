import { Link } from 'react-router-dom'

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="ee-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a3df0" />
          <stop offset="1" stopColor="#ff5d73" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#ee-logo)" />
      <path
        d="M10 14a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6z"
        fill="#fff"
      />
      <path
        d="M16 20.2l3 3 5-6"
        stroke="#5a3df0"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight"
    >
      <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
        <LogoMark />
      </span>
      <span className={light ? 'text-white' : 'text-ink'}>
        Event<span className="text-brand">Ease</span>
      </span>
    </Link>
  )
}