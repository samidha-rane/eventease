import express from 'express'
import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'eventease-api',
    time: new Date().toISOString(),
  })
})

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong' })
})