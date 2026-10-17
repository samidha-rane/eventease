import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../lib/jwt'
import { AppError } from '../lib/errors'

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true },
  })
  if (!user) throw new AppError(401, 'Please log in')

  res.locals.user = user
  next()
}

// Use after requireAuth: blocks everyone who is not an admin
export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required')
  }
  next()
}