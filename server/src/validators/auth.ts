import { z } from 'zod'

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email,
  phone: z.string().trim().max(20).optional(),
  // bcrypt only uses the first 72 characters, so we cap it there
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})