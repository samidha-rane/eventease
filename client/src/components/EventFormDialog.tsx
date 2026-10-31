import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Check, Info } from 'lucide-react'
import Field from '@/components/Field'
import { useCategories } from '@/hooks/queries'
import { useAvailability, useVenues } from '@/hooks/adminQueries'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatRange } from '@/lib/format'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'
import type { EventItem } from '@/types'

const NEW = '__new__'

const isWhole = (value: string) => Number.isInteger(Number(value)) && Number(value) >= 1

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    categoryId: z.string().min(1, 'Choose a category'),
    newCategory: z.string().max(50, 'Category name is too long'),
    venueId: z.string().min(1, 'Choose a venue'),
    newVenueName: z.string().max(100, 'Venue name is too long'),
    newVenueAddress: z.string().max(200, 'Address is too long'),
    newVenueCapacity: z.string(),
    startsAt: z.string().min(1, 'Choose a start time'),
    endsAt: z.string().min(1, 'Choose an end time'),
    registrationDeadline: z.string().min(1, 'Choose a registration deadline'),
    capacity: z
      .string()
      .min(1, 'Enter the number of seats')
      .refine(isWhole, 'Seats must be a whole number of 1 or more'),
  })
  .superRefine((v, ctx) => {
    const add = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (v.categoryId === NEW && v.newCategory.trim().length < 2) {
      add('newCategory', 'Enter the new category name (at least 2 characters)')
    }
    if (v.venueId === NEW) {
      if (v.newVenueName.trim().length < 2) add('newVenueName', 'Enter the new venue name')
      if (v.newVenueAddress.trim().length < 2) add('newVenueAddress', 'Enter the venue address')
      if (!isWhole(v.newVenueCapacity)) {
        add('newVenueCapacity', 'Enter how many people the venue holds (a whole number)')
      }
    }
    if (v.startsAt && v.endsAt && new Date(v.endsAt) <= new Date(v.startsAt)) {
      add('endsAt', 'The end must be after the start')
    }
    if (
      v.startsAt &&
      v.registrationDeadline &&
      new Date(v.registrationDeadline) > new Date(v.startsAt)
    ) {
      add('registrationDeadline', 'The deadline must be before the event starts')
    }
  })

type FormValues = z.infer<typeof schema>

// The browser's date picker wants local time like 2026-11-10T15:30
function toLocalInput(iso: string) {
  const date = new Date(iso)
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return shifted.toISOString().slice(0, 16)
}

// Waits until the value stops changing, so we don't ask the server on every keystroke
function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function Form({ event, onDone }: { event: EventItem | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const categories = useCategories()
  const venues = useVenues()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      categoryId: event?.category.id ?? '',
      newCategory: '',
      venueId: event?.venue.id ?? '',
      newVenueName: '',
      newVenueAddress: '',
      newVenueCapacity: '',
      startsAt: event ? toLocalInput(event.startsAt) : '',
      endsAt: event ? toLocalInput(event.endsAt) : '',
      registrationDeadline: event ? toLocalInput(event.registrationDeadline) : '',
      capacity: event ? String(event.capacity) : '',
    },
  })

  const [categoryId, venueId, startsAt, endsAt] = watch(['categoryId', 'venueId', 'startsAt', 'endsAt'])
  const newVenueName = watch('newVenueName')
  const newCategory = watch('newCategory')

  const findCategory = (name: string) =>
    categories.data?.find((item) => item.name.toLowerCase() === name.trim().toLowerCase())
  const findVenue = (name: string) =>
    venues.data?.find((item) => item.name.toLowerCase() === name.trim().toLowerCase())

  // Ask the server whether the venue is free, half a second after the last change
  const live = `${venueId}|${startsAt}|${endsAt}`
  const settled = useDebounced(live, 500)
  const [dv, ds, de] = settled.split('|')
  const validSlot = dv !== '' && dv !== NEW && ds !== '' && de !== '' && new Date(de) > new Date(ds)

  const availability = useAvailability(
    validSlot
      ? {
          venueId: dv,
          startsAt: new Date(ds).toISOString(),
          endsAt: new Date(de).toISOString(),
          excludeEventId: event?.id,
        }
      : null,
  )
  const waiting = settled !== live || availability.isFetching
  const hard = availability.data?.conflicts.filter((item) => item.status === 'PUBLISHED') ?? []
  const soft = availability.data?.conflicts.filter((item) => item.status === 'DRAFT') ?? []

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      let resolvedCategory = values.categoryId
      if (resolvedCategory === NEW) {
        const existing = findCategory(values.newCategory)
        resolvedCategory = existing
          ? existing.id
          : (
              await api<{ category: { id: string } }>('/categories', {
                method: 'POST',
                body: { name: values.newCategory.trim() },
              })
            ).category.id
      }

      let resolvedVenue = values.venueId
      if (resolvedVenue === NEW) {
        const existing = findVenue(values.newVenueName)
        resolvedVenue = existing
          ? existing.id
          : (
              await api<{ venue: { id: string } }>('/venues', {
                method: 'POST',
                body: {
                  name: values.newVenueName.trim(),
                  address: values.newVenueAddress.trim(),
                  capacity: Number(values.newVenueCapacity),
                },
              })
            ).venue.id
      }

      const body = {
        title: values.title,
        description: values.description,
        categoryId: resolvedCategory,
        venueId: resolvedVenue,
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
      for (const key of ['events', 'event', 'overview', 'categories', 'venues', 'availability']) {
        queryClient.invalidateQueries({ queryKey: [key] })
      }
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

  function onSubmit(values: FormValues) {
    setFormError('')

    const existingVenue =
      values.venueId === NEW
        ? findVenue(values.newVenueName)
        : venues.data?.find((item) => item.id === values.venueId)
    const venueCapacity =
      values.venueId === NEW && !existingVenue
        ? Number(values.newVenueCapacity)
        : existingVenue?.capacity

    if (venueCapacity !== undefined && Number(values.capacity) > venueCapacity) {
      setError('capacity', { message: `Seats cannot exceed the venue capacity (${venueCapacity})` })
      return
    }

    if (!waiting && hard.length > 0) {
      setFormError('That venue is already booked at that time. Choose another time or venue.')
      return
    }

    save.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

      <Field id="categoryId" label="Category" error={errors.categoryId?.message}>
        <select id="categoryId" className={inputCls} {...register('categoryId')}>
          <option value="">Choose…</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value={NEW}>+ Add a new category</option>
        </select>
      </Field>

      {categoryId === NEW && (
        <Field id="newCategory" label="New category name" error={errors.newCategory?.message}>
          <input
            id="newCategory"
            placeholder="For example: Sports Day"
            className={inputCls}
            {...register('newCategory')}
          />
          {findCategory(newCategory) && (
            <p className="mt-1.5 text-xs text-muted">
              This category already exists, so the existing one will be used.
            </p>
          )}
        </Field>
      )}

      <Field id="venueId" label="Venue" error={errors.venueId?.message}>
        <select id="venueId" className={inputCls} {...register('venueId')}>
          <option value="">Choose…</option>
          {venues.data?.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name} (holds {venue.capacity})
            </option>
          ))}
          <option value={NEW}>+ Add a new venue</option>
        </select>
      </Field>

      {venueId === NEW && (
        <div className="space-y-4 rounded-2xl border border-line bg-paper p-4">
          <Field id="newVenueName" label="New venue name" error={errors.newVenueName?.message}>
            <input id="newVenueName" className={inputCls} {...register('newVenueName')} />
            {findVenue(newVenueName) && (
              <p className="mt-1.5 text-xs text-muted">
                This venue already exists, so the existing one will be used.
              </p>
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Field id="newVenueAddress" label="Address" error={errors.newVenueAddress?.message}>
              <input id="newVenueAddress" className={inputCls} {...register('newVenueAddress')} />
            </Field>
            <Field id="newVenueCapacity" label="Holds (people)" error={errors.newVenueCapacity?.message}>
              <input
                id="newVenueCapacity"
                inputMode="numeric"
                className={inputCls}
                {...register('newVenueCapacity')}
              />
            </Field>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="startsAt" label="Starts" error={errors.startsAt?.message}>
          <input id="startsAt" type="datetime-local" className={inputCls} {...register('startsAt')} />
        </Field>
        <Field id="endsAt" label="Ends" error={errors.endsAt?.message}>
          <input id="endsAt" type="datetime-local" className={inputCls} {...register('endsAt')} />
        </Field>
      </div>

      <div aria-live="polite">
        {validSlot && waiting && (
          <p className="text-sm text-muted">Checking whether the venue is free…</p>
        )}

        {validSlot && !waiting && hard.length > 0 && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">This venue is already booked at that time.</p>
            <ul className="mt-1 list-disc pl-5">
              {hard.map((item) => (
                <li key={item.id}>
                  {item.title}, {formatDate(item.startsAt)}, {formatRange(item.startsAt, item.endsAt)}
                </li>
              ))}
            </ul>
            <p className="mt-1">Choose another time or another venue before saving.</p>
          </div>
        )}

        {validSlot && !waiting && hard.length === 0 && soft.length > 0 && (
          <div role="status" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              A draft event also uses this slot ({soft.map((item) => item.title).join(', ')}). You can save,
              but only one of them can be published.
            </p>
          </div>
        )}

        {validSlot && !waiting && availability.data && hard.length === 0 && soft.length === 0 && (
          <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <Check size={16} aria-hidden="true" /> The venue is free at that time.
          </p>
        )}
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