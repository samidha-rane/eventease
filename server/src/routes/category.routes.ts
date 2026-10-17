import { Router } from 'express'
import { create, list, remove, update } from '../controllers/category.controller'
import { requireAdmin, requireAuth } from '../middleware/auth'

export const categoryRouter = Router()

categoryRouter.get('/', list)
categoryRouter.post('/', requireAuth, requireAdmin, create)
categoryRouter.patch('/:id', requireAuth, requireAdmin, update)
categoryRouter.delete('/:id', requireAuth, requireAdmin, remove)