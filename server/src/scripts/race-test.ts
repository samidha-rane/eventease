import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { registerForEvent } from '../services/registration.service'

const DAY = 24 * 60 * 60 * 1000

async function main() {
  const [admin, category, venue] = await Promise.all([
    prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } }),
    prisma.category.findFirstOrThrow(),
    prisma.venue.findFirstOrThrow({ where: { capacity: { gte: 2 } } }),
  ])

  const tag = Date.now()
  const event = await prisma.event.create({
    data: {
      title: `RACE TEST ${tag}`,
      description: 'Temporary event for the concurrency test',
      startsAt: new Date(Date.now() + 30 * DAY),
      endsAt: new Date(Date.now() + 30 * DAY + 2 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 29 * DAY),
      capacity: 2,
      status: 'PUBLISHED',
      categoryId: category.id,
      venueId: venue.id,
      createdById: admin.id,
    },
  })

  const users = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      prisma.user.create({
        data: {
          name: `Race ${i}`,
          email: `race${tag}-${i}@example.test`,
          passwordHash: 'not-a-real-hash',
        },
      }),
    ),
  )

  try {
    // All six start at the same time
    const results = await Promise.allSettled(
      users.map((u) => registerForEvent(event.id, u.id)),
    )

    const failed = results.filter((r) => r.status === 'rejected').length
    const confirmed = await prisma.registration.count({
      where: { eventId: event.id, status: 'CONFIRMED' },
    })
    const waitlisted = await prisma.registration.count({
      where: { eventId: event.id, status: 'WAITLISTED' },
    })

    console.log({ capacity: 2, confirmed, waitlisted, failed })

    if (confirmed === 2 && waitlisted === 4 && failed === 0) {
      console.log('PASS: capacity was never exceeded')
    } else {
      console.log('FAIL: unexpected counts')
      process.exitCode = 1
    }
  } finally {
    await prisma.registration.deleteMany({ where: { eventId: event.id } })
    await prisma.event.delete({ where: { id: event.id } })
    await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } })
  }
}

main()
  .catch((error) => {
    console.error('Test crashed:', error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())