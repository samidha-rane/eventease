import { Router } from 'express'
import { cancel, listAll, mine } from '../controllers/registration.controller'
import {
  checkInRegistration,
  confirm,
  myFeedback,
} from '../controllers/registrationExtras.controller'
import { requireAdmin, requireAuth } from '../middleware/auth'

export const registrationRouter = Router()

registrationRouter.get('/me', requireAuth, mine)
registrationRouter.get('/me/feedback', requireAuth, myFeedback)
registrationRouter.get('/', requireAuth, requireAdmin, listAll)
registrationRouter.post('/:id/cancel', requireAuth, cancel)
registrationRouter.post('/:id/confirm', requireAuth, requireAdmin, confirm)
registrationRouter.post('/:id/check-in', requireAuth, requireAdmin, checkInRegistration)