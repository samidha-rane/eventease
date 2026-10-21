import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, me, register } from '../controllers/auth.controller'
import { changeMyPassword, updateMe } from '../controllers/profile.controller'
import { requireAuth } from '../middleware/auth'

// Max 20 login or register attempts per 15 minutes from one address
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
})

export const authRouter = Router()

authRouter.post('/register', authLimiter, register)
authRouter.post('/login', authLimiter, login)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)
authRouter.patch('/me', requireAuth, updateMe)
authRouter.post('/change-password', requireAuth, authLimiter, changeMyPassword)