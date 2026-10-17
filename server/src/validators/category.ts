import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(50),
  description: z.string().trim().max(200).optional(),
})

export const updateCategorySchema = createCategorySchema.partial()
