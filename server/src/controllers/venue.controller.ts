import type { Request, Response } from 'express'
import { createVenueSchema, updateVenueSchema } from '../validators/venue'
import * as service from '../services/venue.service'

export async function list(_req: Request, res: Response) {
  res.json({ venues: await service.listVenues() })
}

export async function create(req: Request, res: Response) {
  const data = createVenueSchema.parse(req.body)
  res.status(201).json({ venue: await service.createVenue(data) })
}

export async function update(req: Request, res: Response) {
  const data = updateVenueSchema.parse(req.body)
  res.json({ venue: await service.updateVenue(String(req.params.id), data) })
}

export async function remove(req: Request, res: Response) {
  await service.deleteVenue(String(req.params.id))
  res.json({ message: 'Venue deleted' })
}
