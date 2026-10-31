import { z } from 'zod'

export const availabilityQuerySchema = z
  .object({
    venueId: z.string().min(1, 'Venue is required'),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    excludeEventId: z.string().optional(),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: 'The end time must be after the start time',
    path: ['endsAt'],
  })