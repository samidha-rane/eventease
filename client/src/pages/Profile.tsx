import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import Field from '@/components/Field'
import { useAuth } from '@/hooks/auth'
import { api, ApiError } from '@/lib/api'
import { btnPrimary, inputCls } from '@/lib/styles'
import type { User } from '@/types'

const detailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  phone: z.string().max(20, 'Phone number is too long'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirm: z.string().min(1, 'Repeat the new password'),
  })
  .refine((values) => values.newPassword === values.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type DetailsValues = z.infer<typeof detailsSchema>
type PasswordValues = z.infer<typeof passwordSchema>

function DetailsCard({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [problem, setProblem] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: user.name, phone: user.phone ?? '' },
  })

  const save = useMutation({
    mutationFn: (values: DetailsValues) =>
      api<{ user: User }>('/auth/me', { method: 'PATCH', body: values }),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user)
      setProblem('')
      setMessage('Your details were saved.')
    },
    onError: (error) => {
      setMessage('')
      setProblem(
        error instanceof ApiError
          ? error.fieldErrors.map((item) => item.message).join(' ') || error.message
          : 'Something went wrong',
      )
    },
  })

  return (
    <section className="rounded-3xl border border-line bg-card p-7">
      <h2 className="text-xl font-bold tracking-tight">Your details</h2>
      <form
        onSubmit={handleSubmit((values) => {
          setMessage('')
          save.mutate(values)
        })}
        className="mt-5 space-y-5"
        noValidate
      >
        <Field id="name" label="Full name" error={errors.name?.message}>
          <input id="name" autoComplete="name" className={inputCls} {...register('name')} />
        </Field>

        <Field id="phone" label="Phone (optional)" error={errors.phone?.message}>
          <input id="phone" type="tel" autoComplete="tel" className={inputCls} {...register('phone')} />
        </Field>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            Email
          </label>
          <input id="email" value={user.email} readOnly className={`${inputCls} bg-paper text-muted`} />
          <p className="mt-1.5 text-xs text-muted">Your email is your login, so it can’t be changed here.</p>
        </div>

        {message && (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {problem && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {problem}
          </p>
        )}

        <button type="submit" className={btnPrimary} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  )
}

function PasswordCard() {
  const [message, setMessage] = useState('')
  const [problem, setProblem] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  const change = useMutation({
    mutationFn: (values: PasswordValues) =>
      api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      }),
    onSuccess: () => {
      reset()
      setProblem('')
      setMessage('Your password was updated.')
    },
    onError: (error) => {
      setMessage('')
      setProblem(
        error instanceof ApiError
          ? error.fieldErrors.map((item) => item.message).join(' ') || error.message
          : 'Something went wrong',
      )
    },
  })

  return (
    <section className="rounded-3xl border border-line bg-card p-7">
      <h2 className="text-xl font-bold tracking-tight">Change password</h2>
      <form
        onSubmit={handleSubmit((values) => {
          setMessage('')
          change.mutate(values)
        })}
        className="mt-5 space-y-5"
        noValidate
      >
        <Field id="currentPassword" label="Current password" error={errors.currentPassword?.message}>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className={inputCls}
            {...register('currentPassword')}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="newPassword" label="New password" error={errors.newPassword?.message}>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              {...register('newPassword')}
            />
          </Field>
          <Field id="confirm" label="Repeat new password" error={errors.confirm?.message}>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              {...register('confirm')}
            />
          </Field>
        </div>

        {message && (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {problem && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {problem}
          </p>
        )}

        <button type="submit" className={btnPrimary} disabled={change.isPending}>
          {change.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  )
}

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Your profile</h1>
      <p className="mt-2 text-muted">Keep your details up to date.</p>

      <div className="mt-8 space-y-6">
        <DetailsCard key={user.id} user={user} />
        <PasswordCard />
      </div>
    </div>
  )
}