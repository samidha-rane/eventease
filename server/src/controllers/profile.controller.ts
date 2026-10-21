import type { Request, Response } from 'express'
import { changePasswordSchema, updateProfileSchema } from '../validators/profile'
import * as service from '../services/profile.service'

export async function updateMe(req: Request, res: Response) {
  const input = updateProfileSchema.parse(req.body)
  res.json({ user: await service.updateProfile(res.locals.user.id, input) })
}

export async function changeMyPassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
  await service.changePassword(res.locals.user.id, currentPassword, newPassword)
  res.json({ message: 'Password updated' })
}