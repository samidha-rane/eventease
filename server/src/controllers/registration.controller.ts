import type { Request, Response } from 'express'
import { listRegistrationsQuerySchema } from '../validators/registration'
import * as service from '../services/registration.service'

export async function register(req: Request, res: Response) {
  const registration = await service.registerForEvent(
    String(req.params.id),
    res.locals.user.id,
  )
  res.status(201).json({ registration })
}

export async function mine(_req: Request, res: Response) {
  res.json({ registrations: await service.listMyRegistrations(res.locals.user.id) })
}

export async function listAll(req: Request, res: Response) {
  const query = listRegistrationsQuerySchema.parse(req.query)
  res.json(await service.listRegistrations(query))
}

export async function cancel(req: Request, res: Response) {
  const registration = await service.cancelRegistration(
    String(req.params.id),
    res.locals.user,
  )
  res.json({ registration })
}