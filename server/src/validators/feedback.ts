import { z } from 'zod'

export const createFeedbackSchema = z.object({
  rating: z.number().int('Rating must be a whole number').min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
})

export const listFeedbackQuerySchema = z.object({
  eventId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const listParticipantsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>
export type ListParticipantsQuery = z.infer<typeof listParticipantsQuerySchema>