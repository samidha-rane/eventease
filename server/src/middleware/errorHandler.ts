import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found' })
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Please check the highlighted fields',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  // Invalid JSON in the request body, such as a stray character
  if ((err as { type?: string })?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON' })
  }

  console.error(err)
  res.status(500).json({ message: 'Something went wrong' })
}