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

export function updateProfile(userId: string, input: { name: string; phone?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name, phone: input.phone ? input.phone : null },
    select: publicUser,
  })
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

  const matches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!matches) throw new AppError(400, 'Your current password is incorrect')
  if (currentPassword === newPassword) {
    throw new AppError(400, 'The new password must be different from the current one')
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}