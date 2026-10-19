import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import ConfirmDialog from '@/components/ConfirmDialog'
import Field from '@/components/Field'
import Modal from '@/components/Modal'
import { useCategories } from '@/hooks/queries'
import { api, ApiError } from '@/lib/api'
import { btnGhost, btnPrimary, inputCls } from '@/lib/styles'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  description: z.string().max(200, 'Keep the description under 200 characters'),
})

type Values = z.infer<typeof schema>

const small =
  'rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-ink'
const smallDanger =
  'rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100'

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '' },
  })

  const save = useMutation({
    mutationFn: (values: Values) => {
      const body = { name: values.name, description: values.description || undefined }
      return category
        ? api(`/categories/${category.id}`, { method: 'PATCH', body })
        : api('/categories', { method: 'POST', body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
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
        {category ? 'Edit category' : 'Add category'}
      </h2>

      <Field id="name" label="Name" error={errors.name?.message}>
        <input id="name" className={inputCls} {...register('name')} />
      </Field>
      <Field id="description" label="Description (optional)" error={errors.description?.message}>
        <input id="description" className={inputCls} {...register('description')} />
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
          {save.isPending ? 'Saving…' : 'Save category'}
        </button>
      </div>
    </form>
  )
}

export default function Categories() {
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [problem, setProblem] = useState('')

  const remove = useMutation({
    mutationFn: (id: string) => api(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setProblem('')
      setToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      setToDelete(null)
      setProblem(error instanceof ApiError ? error.message : 'Something went wrong')
    },
  })

  function open(category: Category | null) {
    setEditing(category)
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
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="mt-1 text-muted">Group events by type so people can find them.</p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => open(null)}>
          <Plus size={16} aria-hidden="true" /> Add category
        </button>
      </div>

      {problem && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card">
        {isPending && <div className="h-40 animate-pulse bg-line/40" role="status" aria-label="Loading categories" />}
        {isError && <p className="p-8 text-center text-muted">We couldn’t load the categories.</p>}
        {data && data.length === 0 && (
          <p className="p-10 text-center text-muted">No categories yet. Add your first one.</p>
        )}

        {data && data.length > 0 && (
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">All categories</caption>
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3">Category</th>
                <th scope="col" className="px-5 py-3">Description</th>
                <th scope="col" className="px-5 py-3">Events</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold">{category.name}</th>
                  <td className="px-5 py-4 text-muted">{category.description || '—'}</td>
                  <td className="px-5 py-4">{category._count?.events ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className={small} onClick={() => open(category)}>
                        Edit
                      </button>
                      <button type="button" className={smallDanger} onClick={() => setToDelete(category)}>
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
        <CategoryForm category={editing} onDone={close} />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this category?"
        message={
          toDelete
            ? `“${toDelete.name}” will be removed. Categories that still have events can’t be deleted.`
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