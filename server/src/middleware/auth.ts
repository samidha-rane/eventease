import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../lib/jwt'
import { AppError } from '../lib/errors'

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
} as const

// Blocks the request unless a valid login cookie is present
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined
  if (!token) throw new AppError(401, 'Please log in')

  let userId: string
  try {
    userId = verifyToken(token).sub
  } catch {
    throw new AppError(401, 'Your session has expired. Please log in again')
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect })
  if (!user) throw new AppError(401, 'Please log in')

  res.locals.user = user
  next()
}

// Lets everyone through, but remembers who you are if you are logged in
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined

  if (token) {
    let userId: string | null = null
    try {
      userId = verifyToken(token).sub
    } catch {
      userId = null // an invalid cookie just means "not logged in" here
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect })
      if (user) res.locals.user = user
    }
  }

  next()
}

// Use after requireAuth: blocks everyone who is not an admin
export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required')
  }
  next()
}