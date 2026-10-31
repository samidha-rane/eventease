import type { Request, Response } from 'express'
import { availabilityQuerySchema } from '../validators/availability'
import { checkVenueAvailability } from '../services/availability.service'

export async function availability(req: Request, res: Response) {
  const query = availabilityQuerySchema.parse(req.query)
  res.json(await checkVenueAvailability(query))
}