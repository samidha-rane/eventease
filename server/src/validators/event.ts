import { z } from 'zod'

const eventStatus = z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])

const eventFields = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(120),
  description: z.string().trim().min(10, 'Description is too short').max(5000),
  bannerUrl: z.string().trim().url('Banner must be a valid URL').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  venueId: z.string().min(1, 'Venue is required'),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  registrationDeadline: z.coerce.date(),
  capacity: z.number().int('Capacity must be a whole number').min(1).max(100000),
})

// Date order and capacity are checked in the service against the saved values
export const createEventSchema = eventFields
export const updateEventSchema = eventFields.partial()

export const listEventsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  categoryId: z.string().optional(),
  venueId: z.string().optional(),
  status: eventStatus.optional(),
  when: z.enum(['upcoming', 'ongoing', 'past']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['startsAt', 'createdAt', 'title']).default('startsAt'),
  order: z.enum(['asc', 'desc']).default('asc'),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>