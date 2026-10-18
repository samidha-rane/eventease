import type { ReactNode } from 'react'

type Props = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export default function Field({ id, label, error, children }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}