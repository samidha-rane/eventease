import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim()

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env')
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters')
  }

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
  if (admins.length !== 1) {
    throw new Error(`Expected exactly one admin, found ${admins.length}`)
  }
  const admin = admins[0]

  const taken = await prisma.user.findUnique({ where: { email } })
  if (taken && taken.id !== admin.id) {
    throw new Error('That email already belongs to another account')
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      ...(name ? { name } : {}),
    },
  })

  console.log(`Admin updated. Log in with: ${email}`)
}

main()
  .catch((error) => {
    console.error('Failed:', error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())