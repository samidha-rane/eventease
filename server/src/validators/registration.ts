import { z } from 'zod'

export const listRegistrationsQuerySchema = z.object({
  eventId: z.string().optional(),
  status: z.enum(['CONFIRMED', 'WAITLISTED', 'CANCELLED']).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>