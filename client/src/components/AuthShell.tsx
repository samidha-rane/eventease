import type { ReactNode } from 'react'
import Logo from './Logo'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <Logo light />

        <div className="relative z-10">
          <h2 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight">
            Every great event
            <br />
            starts with a <span className="text-sun">yes.</span>
          </h2>
          <p className="mt-5 max-w-sm text-white/70">
            Discover workshops, seminars, competitions and webinars. Register in seconds and keep
            all your tickets in one place.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/50">© EventEase</p>

        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-brand/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-96 rounded-full bg-sun/20 blur-3xl"
        />
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  )
}