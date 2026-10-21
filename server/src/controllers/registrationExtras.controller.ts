import type { Request, Response } from 'express'
import * as service from '../services/registrationExtras.service'

export async function confirm(req: Request, res: Response) {
  res.json({ registration: await service.confirmWaitlisted(String(req.params.id)) })
}

export async function checkInRegistration(req: Request, res: Response) {
  res.json({ registration: await service.checkIn(String(req.params.id)) })
}

export async function myFeedback(_req: Request, res: Response) {
  res.json({ feedback: await service.listMyFeedback(res.locals.user.id) })
}