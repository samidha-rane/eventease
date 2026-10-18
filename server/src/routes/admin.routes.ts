import { Router } from 'express'
import {
  createFeedback,
  getParticipant,
  listFeedback,
  listParticipants,
  overview,
} from '../controllers/feedback.controller'
import { requireAdmin, requireAuth } from '../middleware/auth'

// Mounted at /api/events: only handles POST /:id/feedback, the rest falls through
export const eventFeedbackRouter = Router()
eventFeedbackRouter.post('/:id/feedback', requireAuth, createFeedback)

// Mounted at /api/feedback
export const feedbackRouter = Router()
feedbackRouter.get('/', requireAuth, requireAdmin, listFeedback)

// Mounted at /api/participants
export const participantRouter = Router()
participantRouter.get('/', requireAuth, requireAdmin, listParticipants)
participantRouter.get('/:id', requireAuth, requireAdmin, getParticipant)

// Mounted at /api/analytics
export const analyticsRouter = Router()
analyticsRouter.get('/overview', requireAuth, requireAdmin, overview)