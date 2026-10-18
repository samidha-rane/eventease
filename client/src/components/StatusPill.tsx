const styles: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  PUBLISHED: 'bg-brand-soft text-brand-dark',
  WAITLISTED: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
  DRAFT: 'bg-slate-100 text-slate-700',
}

const labels: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  PUBLISHED: 'Open',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  DRAFT: 'Draft',
}

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}