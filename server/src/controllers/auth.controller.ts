import type { Request, Response } from 'express'
import { loginSchema, registerSchema } from '../validators/auth'
import { loginUser, registerUser } from '../services/auth.service'
import { signToken } from '../lib/jwt'

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000

const cookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read it
  secure: process.env.NODE_ENV === 'production', // HTTPS only when live
  sameSite: 'lax' as const,
  path: '/',
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)
  const user = await registerUser(input)

  res.cookie('token', signToken(user.id), {
    ...cookieOptions,
    maxAge: SEVEN_DAYS_IN_MS,
  })
  res.status(201).json({ user })
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body)
  const user = await loginUser(email, password)

  res.cookie('token', signToken(user.id), {
    ...cookieOptions,
    maxAge: SEVEN_DAYS_IN_MS,
  })
  res.json({ user })
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token', cookieOptions)
  res.json({ message: 'Logged out' })
}

export function me(_req: Request, res: Response) {
  res.json({ user: res.locals.user })
}