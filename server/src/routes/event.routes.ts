import { Router } from 'express'
import {
  cancel,
  complete,
  create,
  getOne,
  list,
  publish,
  remove,
  update,
} from '../controllers/event.controller'
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth'

export const eventRouter = Router()

// Public, but admins also see drafts and cancelled events
eventRouter.get('/', optionalAuth, list)
eventRouter.get('/:id', optionalAuth, getOne)

eventRouter.post('/', requireAuth, requireAdmin, create)
eventRouter.patch('/:id', requireAuth, requireAdmin, update)
eventRouter.post('/:id/publish', requireAuth, requireAdmin, publish)
eventRouter.post('/:id/cancel', requireAuth, requireAdmin, cancel)
eventRouter.post('/:id/complete', requireAuth, requireAdmin, complete)
eventRouter.delete('/:id', requireAuth, requireAdmin, remove)