import { Router } from 'express'
import { create, list, remove, update } from '../controllers/venue.controller'
import { availability } from '../controllers/availability.controller'
import { requireAdmin, requireAuth } from '../middleware/auth'

export const venueRouter = Router()

venueRouter.get('/availability', requireAuth, requireAdmin, availability)
venueRouter.get('/', list)
venueRouter.post('/', requireAuth, requireAdmin, create)
venueRouter.patch('/:id', requireAuth, requireAdmin, update)
venueRouter.delete('/:id', requireAuth, requireAdmin, remove)