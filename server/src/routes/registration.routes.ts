import { Router } from 'express'
import { cancel, listAll, mine } from '../controllers/registration.controller'
import { requireAdmin, requireAuth } from '../middleware/auth'

export const registrationRouter = Router()

registrationRouter.get('/me', requireAuth, mine)
registrationRouter.get('/', requireAuth, requireAdmin, listAll)
registrationRouter.post('/:id/cancel', requireAuth, cancel)