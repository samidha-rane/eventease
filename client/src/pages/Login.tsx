import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthShell from '@/components/AuthShell'
import Field from '@/components/Field'
import { ApiError } from '@/lib/api'
import { btnPrimary, inputCls } from '@/lib/styles'
import { loginSchema } from '@/schemas/auth'
import type { LoginValues } from '@/schemas/auth'
import { useAuth } from '@/hooks/auth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  if (user) return <Navigate to="/" replace />

  const from = (location.state as { from?: string } | null)?.from

  async function onSubmit(values: LoginValues) {
    setFormError('')
    try {
      const loggedIn = await login(values)
      navigate(from ?? (loggedIn.role === 'ADMIN' ? '/admin' : '/'), { replace: true })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Something went wrong')
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your tickets and register for events."
      footer={
        <>
          New to EventEase?{' '}
          <Link to="/register" className="font-semibold text-brand-dark hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputCls}
            {...register('email')}
          />
        </Field>

        <Field id="password" label="Password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputCls}
            {...register('password')}
          />
        </Field>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full py-3`}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}