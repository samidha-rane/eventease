import { ChevronLeft, ChevronRight } from 'lucide-react'
import { btnGhost } from '@/lib/styles'

type Props = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
      <button
        type="button"
        className={btnGhost}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" /> Previous
      </button>
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className={btnGhost}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}