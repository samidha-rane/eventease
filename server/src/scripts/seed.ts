import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

const categories = [
  { name: 'Workshop', description: 'Hands-on learning sessions' },
  { name: 'Seminar', description: 'Talks and expert presentations' },
  { name: 'Competition', description: 'Contests, hackathons and quizzes' },
  { name: 'Webinar', description: 'Online live sessions' },
  { name: 'Cultural', description: 'Arts, music and cultural events' },
  { name: 'Technical', description: 'Technology and engineering events' },
]

const venues = [
  {
    name: 'Main Auditorium',
    address: '1 Campus Road',
    capacity: 300,
    facilities: ['Projector', 'Microphones', 'Air conditioning'],
  },
  {
    name: 'Seminar Hall A',
    address: '2 Campus Road',
    capacity: 100,
    facilities: ['Projector', 'Whiteboard', 'Wi-Fi'],
  },
  {
    name: 'Computer Lab 1',
    address: 'Technology Block',
    capacity: 40,
    facilities: ['40 computers', 'Wi-Fi', 'Projector'],
  },
  {
    name: 'Online (Video Call)',
    address: 'Virtual',
    capacity: 500,
    facilities: ['Screen sharing', 'Recording'],
  },
]

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  for (const venue of venues) {
    const existing = await prisma.venue.findFirst({ where: { name: venue.name } })
    if (!existing) await prisma.venue.create({ data: venue })
  }

  const name = process.env.ADMIN_NAME
  const email = process.env.ADMIN_EMAIL?.toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  if (!name || !email || !password) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env')
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters')
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { name, email, passwordHash, role: 'ADMIN' },
    })
    console.log(`Admin created: ${email}`)
  } else {
    console.log(`Admin already exists: ${email} (not changed)`)
  }

  console.log('Categories:', await prisma.category.count())
  console.log('Venues:', await prisma.venue.count())
  console.log('Users:', await prisma.user.count())
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())