import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import type { Request, Response } from 'express'
import { authRouter } from './routes/auth.routes'
import { categoryRouter } from './routes/category.routes'
import { venueRouter } from './routes/venue.routes'
import { eventRouter } from './routes/event.routes'
import { registrationRouter } from './routes/registration.routes'
import {
  analyticsRouter,
  eventFeedbackRouter,
  feedbackRouter,
  participantRouter,
} from './routes/admin.routes'
import { errorHandler, notFound } from './middleware/errorHandler'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'eventease-api',
    time: new Date().toISOString(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/venues', venueRouter)
app.use('/api/events', eventFeedbackRouter)
app.use('/api/events', eventRouter)
app.use('/api/registrations', registrationRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/participants', participantRouter)
app.use('/api/analytics', analyticsRouter)

// These two must stay last
app.use(notFound)
app.use(errorHandler)