import { z } from 'zod'

export const createVenueSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  address: z.string().trim().min(2, 'Address is too short').max(200),
  capacity: z.number().int('Capacity must be a whole number').min(1).max(100000),
  facilities: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
})

export const updateVenueSchema = createVenueSchema.partial()
