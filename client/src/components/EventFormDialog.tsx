import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import Field from '@/components/Field'
import { useCategories } from '@/hooks/queries'
import { useVenues } from '@/hooks/adminQueries'
import { api, ApiError } from '@/lib/api'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'
import type { EventItem } from '@/types'

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    categoryId: z.string().min(1, 'Choose a category'),
    venueId: z.string().min(1, 'Choose a venue'),
    startsAt: z.string().min(1, 'Choose a start time'),
    endsAt: z.string().min(1, 'Choose an end time'),
    registrationDeadline: z.string().min(1, 'Choose a registration deadline'),
    capacity: z
      .string()
      .min(1, 'Enter the number of seats')
      .refine(
        (value) => Number.isInteger(Number(value)) && Number(value) >= 1,
        'Seats must be a whole number of 1 or more',
      ),
  })
  .refine((v) => !v.startsAt || !v.endsAt || new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'The end must be after the start',
    path: ['endsAt'],
  })
  .refine(
    (v) =>
      !v.startsAt ||
      !v.registrationDeadline ||
      new Date(v.registrationDeadline) <= new Date(v.startsAt),
    { message: 'The deadline must be before the event starts', path: ['registrationDeadline'] },
  )

type FormValues = z.infer<typeof schema>

// The browser's date picker wants local time like 2026-11-10T15:30
function toLocalInput(iso: string) {
  const date = new Date(iso)
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return shifted.toISOString().slice(0, 16)
}

function Form({ event, onDone }: { event: EventItem | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const categories = useCategories()
  const venues = useVenues()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          categoryId: event.category.id,
          venueId: event.venue.id,
          startsAt: toLocalInput(event.startsAt),
          endsAt: toLocalInput(event.endsAt),
          registrationDeadline: toLocalInput(event.registrationDeadline),
          capacity: String(event.capacity),
        }
      : {
          title: '',
          description: '',
          categoryId: '',
          venueId: '',
          startsAt: '',
          endsAt: '',
          registrationDeadline: '',
          capacity: '',
        },
  })

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        venueId: values.venueId,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        registrationDeadline: new Date(values.registrationDeadline).toISOString(),
        capacity: Number(values.capacity),
      }
      return event
        ? api(`/events/${event.id}`, { method: 'PATCH', body })
        : api('/events', { method: 'POST', body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      onDone()
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const details = error.fieldErrors.map((item) => item.message).join(' ')
        setFormError(details || error.message)
      } else {
        setFormError('Something went wrong')
      }
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => {
        setFormError('')
        save.mutate(values)
      })}
      className="space-y-4"
      noValidate
    >
      <h2 className="font-display text-2xl font-extrabold tracking-tight">
        {event ? 'Edit event' : 'Create event'}
      </h2>
      {!event && (
        <p className="text-sm text-muted">New events start as a draft. Publish them when you’re ready.</p>
      )}

      <Field id="title" label="Title" error={errors.title?.message}>
        <input id="title" className={inputCls} {...register('title')} />
      </Field>

      <Field id="description" label="Description" error={errors.description?.message}>
        <textarea id="description" rows={4} className={inputCls} {...register('description')} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="categoryId" label="Category" error={errors.categoryId?.message}>
          <select id="categoryId" className={inputCls} {...register('categoryId')}>
            <option value="">Choose…</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="venueId" label="Venue" error={errors.venueId?.message}>
          <select id="venueId" className={inputCls} {...register('venueId')}>
            <option value="">Choose…</option>
            {venues.data?.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name} (holds {venue.capacity})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="startsAt" label="Starts" error={errors.startsAt?.message}>
          <input id="startsAt" type="datetime-local" className={inputCls} {...register('startsAt')} />
        </Field>
        <Field id="endsAt" label="Ends" error={errors.endsAt?.message}>
          <input id="endsAt" type="datetime-local" className={inputCls} {...register('endsAt')} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="registrationDeadline"
          label="Register by"
          error={errors.registrationDeadline?.message}
        >
          <input
            id="registrationDeadline"
            type="datetime-local"
            className={inputCls}
            {...register('registrationDeadline')}
          />
        </Field>
        <Field id="capacity" label="Seats" error={errors.capacity?.message}>
          <input id="capacity" inputMode="numeric" className={inputCls} {...register('capacity')} />
        </Field>
      </div>

      {formError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className={btnGhost} onClick={onDone} disabled={save.isPending}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : event ? 'Save changes' : 'Create draft'}
        </button>
      </div>
    </form>
  )
}

type Props = {
  open: boolean
  event: EventItem | null
  onClose: () => void
}

export default function EventFormDialog({ open, event, onClose }: Props) {
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
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto max-h-[92vh] w-[min(94vw,40rem)] overflow-y-auto rounded-3xl border border-line bg-card p-6 text-ink backdrop:bg-ink/50"
    >
      {open && <Form key={event?.id ?? 'new'} event={event} onDone={onClose} />}
    </dialog>
  )
}