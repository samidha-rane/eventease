import type { Request, Response } from 'express'
import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from '../validators/event'
import * as service from '../services/event.service'

const isAdmin = (res: Response) => res.locals.user?.role === 'ADMIN'

export async function list(req: Request, res: Response) {
  const query = listEventsQuerySchema.parse(req.query)
  res.json(await service.listEvents(query, isAdmin(res)))
}

export async function getOne(req: Request, res: Response) {
  res.json({ event: await service.getEvent(String(req.params.id), isAdmin(res)) })
}

export async function create(req: Request, res: Response) {
  const input = createEventSchema.parse(req.body)
  const event = await service.createEvent(input, res.locals.user.id)
  res.status(201).json({ event })
}

export async function update(req: Request, res: Response) {
  const input = updateEventSchema.parse(req.body)
  res.json({ event: await service.updateEvent(String(req.params.id), input) })
}

export async function publish(req: Request, res: Response) {
  res.json({ event: await service.changeStatus(String(req.params.id), 'PUBLISHED') })
}

export async function cancel(req: Request, res: Response) {
  res.json({ event: await service.changeStatus(String(req.params.id), 'CANCELLED') })
}

export async function complete(req: Request, res: Response) {
  res.json({ event: await service.changeStatus(String(req.params.id), 'COMPLETED') })
}

export async function remove(req: Request, res: Response) {
  await service.deleteEvent(String(req.params.id))
  res.json({ message: 'Event deleted' })
}