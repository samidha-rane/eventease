import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import ConfirmDialog from '@/components/ConfirmDialog'
import Field from '@/components/Field'
import Modal from '@/components/Modal'
import { useVenues } from '@/hooks/adminQueries'
import { api, ApiError } from '@/lib/api'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'
import type { Venue } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  address: z.string().min(2, 'Address must be at least 2 characters').max(200),
  capacity: z
    .string()
    .min(1, 'Enter the capacity')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'Capacity must be a whole number of 1 or more'),
  facilities: z.string().max(400),
})

type Values = z.infer<typeof schema>

const small =
  'rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-ink'
const smallDanger =
  'rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100'

function VenueForm({ venue, onDone }: { venue: Venue | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: venue?.name ?? '',
      address: venue?.address ?? '',
      capacity: venue ? String(venue.capacity) : '',
      facilities: venue?.facilities.join(', ') ?? '',
    },
  })

  const save = useMutation({
    mutationFn: (values: Values) => {
      const body = {
        name: values.name,
        address: values.address,
        capacity: Number(values.capacity),
        facilities: values.facilities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }
      return venue
        ? api(`/venues/${venue.id}`, { method: 'PATCH', body })
        : api('/venues', { method: 'POST', body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      onDone()
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.fieldErrors.map((f) => f.message).join(' ') || error.message)
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
        {venue ? 'Edit venue' : 'Add venue'}
      </h2>

      <Field id="name" label="Name" error={errors.name?.message}>
        <input id="name" className={inputCls} {...register('name')} />
      </Field>
      <Field id="address" label="Address" error={errors.address?.message}>
        <input id="address" className={inputCls} {...register('address')} />
      </Field>
      <Field id="capacity" label="Capacity (people)" error={errors.capacity?.message}>
        <input id="capacity" inputMode="numeric" className={inputCls} {...register('capacity')} />
      </Field>
      <Field id="facilities" label="Facilities (separated by commas)" error={errors.facilities?.message}>
        <input
          id="facilities"
          placeholder="Projector, Wi-Fi, Microphones"
          className={inputCls}
          {...register('facilities')}
        />
      </Field>

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
          {save.isPending ? 'Saving…' : 'Save venue'}
        </button>
      </div>
    </form>
  )
}

export default function Venues() {
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useVenues()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Venue | null>(null)
  const [toDelete, setToDelete] = useState<Venue | null>(null)
  const [problem, setProblem] = useState('')

  const remove = useMutation({
    mutationFn: (id: string) => api(`/venues/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setProblem('')
      setToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
    onError: (error) => {
      setToDelete(null)
      setProblem(error instanceof ApiError ? error.message : 'Something went wrong')
    },
  })

  function open(venue: Venue | null) {
    setEditing(venue)
    setFormOpen(true)
  }

  function close() {
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Venues</h1>
          <p className="mt-1 text-muted">Where your events happen, and how many people fit.</p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => open(null)}>
          <Plus size={16} aria-hidden="true" /> Add venue
        </button>
      </div>

      {problem && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
        {isPending && <div className="h-40 animate-pulse bg-line/40" role="status" aria-label="Loading venues" />}
        {isError && <p className="p-8 text-center text-muted">We couldn’t load the venues.</p>}
        {data && data.length === 0 && (
          <p className="p-10 text-center text-muted">No venues yet. Add your first one.</p>
        )}

        {data && data.length > 0 && (
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">All venues</caption>
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">Venue</th>
                <th scope="col" className="px-5 py-3">Address</th>
                <th scope="col" className="px-5 py-3">Capacity</th>
                <th scope="col" className="px-5 py-3">Facilities</th>
                <th scope="col" className="px-5 py-3">Events</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((venue) => (
                <tr key={venue.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold">{venue.name}</th>
                  <td className="px-5 py-4">{venue.address}</td>
                  <td className="px-5 py-4">{venue.capacity}</td>
                  <td className="px-5 py-4 text-muted">{venue.facilities.join(', ') || '—'}</td>
                  <td className="px-5 py-4">{venue._count?.events ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className={small} onClick={() => open(venue)}>
                        Edit
                      </button>
                      <button type="button" className={smallDanger} onClick={() => setToDelete(venue)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={formOpen} onClose={close}>
        <VenueForm venue={editing} onDone={close} />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this venue?"
        message={
          toDelete
            ? `“${toDelete.name}” will be removed. Venues that still have events can’t be deleted.`
            : ''
        }
        confirmLabel="Yes, delete it"
        busy={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}