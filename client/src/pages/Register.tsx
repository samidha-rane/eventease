import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthShell from '@/components/AuthShell'
import Field from '@/components/Field'
import { ApiError } from '@/lib/api'
import { btnPrimary, inputCls } from '@/lib/styles'
import { registerSchema } from '@/schemas/auth'
import type { RegisterValues } from '@/schemas/auth'
import { useAuth } from '@/hooks/auth'

const knownFields = ['name', 'email', 'phone', 'password'] as const

export default function Register() {
  const { user, register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '' },
  })

  if (user) return <Navigate to="/" replace />

  async function onSubmit(values: RegisterValues) {
    setFormError('')
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        // Show server-side field errors next to the right input
        let shown = false
        for (const item of error.fieldErrors) {
          const field = knownFields.find((name) => name === item.field)
          if (field) {
            setError(field, { message: item.message })
            shown = true
          }
        }
        if (!shown) setFormError(error.message)
      } else {
        setFormError('Something went wrong')
      }
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-dark hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field id="name" label="Full name" error={errors.name?.message}>
          <input id="name" autoComplete="name" className={inputCls} {...register('name')} />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputCls}
            {...register('email')}
          />
        </Field>

        <Field id="phone" label="Phone (optional)" error={errors.phone?.message}>
          <input id="phone" type="tel" autoComplete="tel" className={inputCls} {...register('phone')} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="password" label="Password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              {...register('password')}
            />
          </Field>

          <Field id="confirm" label="Repeat password" error={errors.confirm?.message}>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              {...register('confirm')}
            />
          </Field>
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full py-3`}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}