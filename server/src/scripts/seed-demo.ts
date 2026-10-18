import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/prisma'

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000
const DEMO_DOMAIN = '@demo.eventease.test'

type DemoEvent = {
  title: string
  description: string
  category: string
  venue: string
  dayOffset: number
  hourUtc: number
  hours: number
  capacity: number
  filled: number
  waitlisted?: number
}

const demoEvents: DemoEvent[] = [
  {
    title: 'Web Development Basics Workshop',
    description:
      'Build your first web page from scratch. We cover HTML, CSS and a little JavaScript, and you leave with a page you made yourself. Bring your laptop.',
    category: 'Workshop',
    venue: 'Computer Lab 1',
    dayOffset: 4,
    hourUtc: 4,
    hours: 3,
    capacity: 20,
    filled: 17,
  },
  {
    title: 'Careers in AI Seminar',
    description:
      'Industry speakers explain what working in AI really looks like, which skills matter, and how to land your first role. Questions are welcome at the end.',
    category: 'Seminar',
    venue: 'Seminar Hall A',
    dayOffset: 6,
    hourUtc: 5,
    hours: 2,
    capacity: 60,
    filled: 22,
  },
  {
    title: 'Campus Hackathon 24',
    description:
      'Team up with friends and build something useful in one day. Prizes for the top three teams, snacks all day, and mentors on hand to help when you get stuck.',
    category: 'Competition',
    venue: 'Main Auditorium',
    dayOffset: 9,
    hourUtc: 3,
    hours: 8,
    capacity: 30,
    filled: 24,
  },
  {
    title: 'Open Mic Night',
    description:
      'Music, poetry, comedy or anything else you want to share on stage. Sign up to perform or just come to cheer everyone on.',
    category: 'Cultural',
    venue: 'Main Auditorium',
    dayOffset: 12,
    hourUtc: 12,
    hours: 3,
    capacity: 100,
    filled: 18,
  },
  {
    title: 'Data Analysis with Python Webinar',
    description:
      'A live online walkthrough of cleaning and charting real data with Python. Beginners are welcome, and the recording is shared with everyone who registers.',
    category: 'Webinar',
    venue: 'Online (Video Call)',
    dayOffset: 15,
    hourUtc: 9,
    hours: 2,
    capacity: 200,
    filled: 24,
  },
  {
    title: 'Technical Quiz Showdown',
    description:
      'Teams of three battle through rounds on programming, electronics and general tech. Quick fire questions, a live scoreboard and a trophy for the winners.',
    category: 'Competition',
    venue: 'Seminar Hall A',
    dayOffset: 19,
    hourUtc: 6,
    hours: 2,
    capacity: 40,
    filled: 12,
  },
  {
    title: 'UI Design Sprint',
    description:
      'Design a mobile app screen in one afternoon, from sketch to polished mockup. Small group, so seats go fast. Join the waitlist if it is full.',
    category: 'Workshop',
    venue: 'Computer Lab 1',
    dayOffset: 26,
    hourUtc: 5,
    hours: 4,
    capacity: 12,
    filled: 12,
    waitlisted: 3,
  },
  {
    title: 'Cloud Computing Seminar',
    description:
      'What the cloud is, why every company uses it, and how to start learning it for free. Includes a short live demo.',
    category: 'Technical',
    venue: 'Main Auditorium',
    dayOffset: 30,
    hourUtc: 5,
    hours: 2,
    capacity: 150,
    filled: 9,
  },
  {
    title: 'Resume Building Workshop',
    description:
      'Turn your experience into a one-page resume that gets noticed. Includes live feedback from recruiters.',
    category: 'Workshop',
    venue: 'Seminar Hall A',
    dayOffset: -12,
    hourUtc: 5,
    hours: 2,
    capacity: 30,
    filled: 22,
  },
  {
    title: 'Intro to Cybersecurity Webinar',
    description:
      'How attackers think, how to protect your accounts, and what a career in security looks like.',
    category: 'Webinar',
    venue: 'Online (Video Call)',
    dayOffset: -25,
    hourUtc: 9,
    hours: 2,
    capacity: 100,
    filled: 24,
  },
]

const names = [
  'Aarav Patil', 'Diya Naik', 'Rohan Desai', 'Isha Kamat', 'Kabir Sawant', 'Meera Joshi',
  'Arjun Gawde', 'Sneha Parab', 'Vivaan Rane', 'Anaya Kulkarni', 'Ishaan Shetty', 'Tara Bhat',
  'Aditya More', 'Riya Dalvi', 'Yash Chavan', 'Kavya Nair', 'Omkar Mhatre', 'Pooja Gaonkar',
  'Siddharth Redkar', 'Nisha Prabhu', 'Harsh Salvi', 'Ananya Pai', 'Dev Kerkar', 'Simran Dessai',
]

const comments = [
  'Really well organised and easy to follow.',
  'Learned a lot and the speaker was great.',
  'Good content. I would attend another one.',
  'Loved the hands-on part.',
]

async function clear() {
  const users = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_DOMAIN } },
    select: { id: true },
  })
  const events = await prisma.event.findMany({
    where: { title: { in: demoEvents.map((event) => event.title) } },
    select: { id: true },
  })
  const userIds = users.map((user) => user.id)
  const eventIds = events.map((event) => event.id)

  await prisma.feedback.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { eventId: { in: eventIds } }] },
  })
  await prisma.registration.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { eventId: { in: eventIds } }] },
  })
  await prisma.event.deleteMany({ where: { id: { in: eventIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })

  console.log(`Removed ${eventIds.length} demo events and ${userIds.length} demo users`)
}

async function seed() {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } })
  const categories = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]))
  const venues = new Map((await prisma.venue.findMany()).map((v) => [v.name, v]))

  // Fake participants. Their passwords are random, so nobody can log in as them.
  const passwordHash = bcrypt.hashSync(randomUUID(), 4)
  await prisma.user.createMany({
    data: names.map((name, index) => ({
      name,
      email: `demo${String(index + 1).padStart(2, '0')}${DEMO_DOMAIN}`,
      passwordHash,
    })),
    skipDuplicates: true,
  })
  const users = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_DOMAIN } },
    orderBy: { email: 'asc' },
  })

  const midnight = new Date()
  midnight.setUTCHours(0, 0, 0, 0)

  for (const item of demoEvents) {
    const categoryId = categories.get(item.category)
    const venue = venues.get(item.venue)
    if (!categoryId || !venue) {
      throw new Error(`Missing category or venue for "${item.title}". Run npm run db:seed first.`)
    }

    const startsAt = new Date(midnight.getTime() + item.dayOffset * DAY + item.hourUtc * HOUR)
    const past = item.dayOffset < 0

    let event = await prisma.event.findFirst({ where: { title: item.title } })
    if (!event) {
      event = await prisma.event.create({
        data: {
          title: item.title,
          description: item.description,
          startsAt,
          endsAt: new Date(startsAt.getTime() + item.hours * HOUR),
          registrationDeadline: new Date(startsAt.getTime() - DAY),
          capacity: Math.min(item.capacity, venue.capacity),
          status: past ? 'COMPLETED' : 'PUBLISHED',
          categoryId,
          venueId: venue.id,
          createdById: admin.id,
        },
      })
    }

    const confirmed = users.slice(0, item.filled)
    const waiting = users.slice(item.filled, item.filled + (item.waitlisted ?? 0))

    await prisma.registration.createMany({
      data: [
        ...confirmed.map((user, index) => ({
          userId: user.id,
          eventId: event.id,
          status: 'CONFIRMED' as const,
          registeredAt: new Date(Date.now() - (index + 1) * 5 * HOUR),
        })),
        ...waiting.map((user, index) => ({
          userId: user.id,
          eventId: event.id,
          status: 'WAITLISTED' as const,
          registeredAt: new Date(Date.now() - (index + 1) * HOUR),
        })),
      ],
      skipDuplicates: true,
    })

    if (past) {
      await prisma.feedback.createMany({
        data: confirmed.slice(0, 12).map((user, index) => ({
          userId: user.id,
          eventId: event.id,
          rating: [5, 4, 5, 4, 3, 5][index % 6],
          comment: index % 2 === 0 ? comments[index % comments.length] : null,
        })),
        skipDuplicates: true,
      })
    }
  }

  console.log(`Demo data ready: ${demoEvents.length} events, ${users.length} demo participants`)
}

const clearMode = process.argv[2] === 'clear'

;(clearMode ? clear() : seed())
  .catch((error) => {
    console.error('Failed:', error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())