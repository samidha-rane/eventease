import { useEffect, useRef } from 'react'
import { btnDanger, btnGhost } from '@/lib/styles'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-3xl border border-line bg-card p-6 text-ink backdrop:bg-ink/50"
    >
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className={btnGhost} onClick={onCancel} disabled={busy}>
          Keep it
        </button>
        <button type="button" className={btnDanger} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}