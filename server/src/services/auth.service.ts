import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

const publicUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
} as const

// Used so a wrong email takes as long to reject as a wrong password
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

export async function registerUser(input: {
  name: string
  email: string
  phone?: string
  password: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        passwordHash,
        role: 'PARTICIPANT', // always. Never taken from the request.
      },
      select: publicUser,
    })
  } catch (error) {
    // Two sign-ups with the same email at the same instant
    if ((error as { code?: string }).code === 'P2002') {
      throw new AppError(409, 'An account with this email already exists')
    }
    throw error
  }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)

  // Same message for "no such email" and "wrong password"
  if (!user || !matches) {
    throw new AppError(401, 'Invalid email or password')
  }

  return prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: publicUser,
  })
}