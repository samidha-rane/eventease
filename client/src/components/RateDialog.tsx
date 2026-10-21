import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '@/components/Modal'
import { api, ApiError } from '@/lib/api'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'

type Target = { id: string; title: string }

function RateForm({ event, onClose }: { event: Target; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [problem, setProblem] = useState('')

  const send = useMutation({
    mutationFn: () =>
      api(`/events/${event.id}/feedback`, {
        method: 'POST',
        body: { rating, comment: comment.trim() || undefined },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      onClose()
    },
    onError: (error) => {
      setProblem(error instanceof ApiError ? error.message : 'Something went wrong')
    },
  })

  function submit() {
    if (rating === 0) {
      setProblem('Please choose a star rating')
      return
    }
    setProblem('')
    send.mutate()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Rate this event</h2>
        <p className="mt-1 text-muted">{event.title}</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`block rounded text-4xl transition hover:scale-110 peer-focus-visible:outline-2 peer-focus-visible:outline-brand ${
                  value <= (hover || rating) ? 'text-amber-400' : 'text-line'
                }`}
              >
                ★
              </span>
              <span className="sr-only">
                {value} star{value > 1 ? 's' : ''}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="comment" className="mb-1.5 block text-sm font-semibold">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What went well? What could be better?"
          className={inputCls}
        />
      </div>

      {problem && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className={btnGhost} onClick={onClose} disabled={send.isPending}>
          Cancel
        </button>
        <button type="button" className={btnPrimary} onClick={submit} disabled={send.isPending}>
          {send.isPending ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
    </div>
  )
}

export default function RateDialog({
  event,
  onClose,
}: {
  event: Target | null
  onClose: () => void
}) {
  return (
    <Modal open={event !== null} onClose={onClose}>
      {event && <RateForm key={event.id} event={event} onClose={onClose} />}
    </Modal>
  )
}