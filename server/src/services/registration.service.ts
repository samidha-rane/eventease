import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import type { ListRegistrationsQuery } from '../validators/registration'

const TX_OPTIONS = { timeout: 15000, maxWait: 10000 }

const withEvent = {
  event: {
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      status: true,
      venue: { select: { name: true, address: true } },
    },
  },
} satisfies Prisma.RegistrationInclude

const withEventAndUser = {
  ...withEvent,
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.RegistrationInclude

// Only one transaction at a time can hold this lock for a given event
async function lockEvent(tx: Prisma.TransactionClient, eventId: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE
  `
  if (rows.length === 0) throw new AppError(404, 'Event not found')
}

async function promoteFromWaitlist(
  tx: Prisma.TransactionClient,
  event: { id: string; capacity: number; status: string; startsAt: Date },
) {
  if (event.status !== 'PUBLISHED' || new Date() >= event.startsAt) return

  const confirmed = await tx.registration.count({
    where: { eventId: event.id, status: 'CONFIRMED' },
  })
  const free = event.capacity - confirmed
  if (free <= 0) return

  const next = await tx.registration.findMany({
    where: { eventId: event.id, status: 'WAITLISTED' },
    orderBy: { registeredAt: 'asc' },
    take: free,
    select: { id: true },
  })
  if (next.length === 0) return

  await tx.registration.updateMany({
    where: { id: { in: next.map((r) => r.id) } },
    data: { status: 'CONFIRMED' },
  })
}

export function registerForEvent(eventId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    await lockEvent(tx, eventId)

    const event = await tx.event.findUniqueOrThrow({ where: { id: eventId } })
    const now = new Date()

    if (event.status !== 'PUBLISHED') {
      throw new AppError(409, 'This event is not open for registration')
    }
    if (now > event.registrationDeadline) {
      throw new AppError(409, 'Registration for this event has closed')
    }
    if (now >= event.startsAt) {
      throw new AppError(409, 'This event has already started')
    }

    const existing = await tx.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    })
    if (existing && existing.status !== 'CANCELLED') {
      throw new AppError(
        409,
        existing.status === 'WAITLISTED'
          ? 'You are already on the waitlist for this event'
          : 'You are already registered for this event',
      )
    }

    const confirmed = await tx.registration.count({
      where: { eventId, status: 'CONFIRMED' },
    })
    const status = confirmed < event.capacity ? ('CONFIRMED' as const) : ('WAITLISTED' as const)

    if (existing) {
      // Re-registering after a cancellation reuses the same row
      return tx.registration.update({
        where: { id: existing.id },
        data: { status, registeredAt: now, cancelledAt: null },
        include: withEvent,
      })
    }

    return tx.registration.create({
      data: { userId, eventId, status },
      include: withEvent,
    })
  }, TX_OPTIONS)
}

export async function cancelRegistration(
  registrationId: string,
  actor: { id: string; role: string },
) {
  const found = await prisma.registration.findUnique({ where: { id: registrationId } })
  // Same answer for "does not exist" and "belongs to someone else"
  if (!found || (actor.role !== 'ADMIN' && found.userId !== actor.id)) {
    throw new AppError(404, 'Registration not found')
  }

  return prisma.$transaction(async (tx) => {
    await lockEvent(tx, found.eventId)

    const current = await tx.registration.findUnique({ where: { id: registrationId } })
    if (!current) throw new AppError(404, 'Registration not found')
    if (current.status === 'CANCELLED') {
      throw new AppError(409, 'This registration is already cancelled')
    }

    const event = await tx.event.findUniqueOrThrow({ where: { id: current.eventId } })
    const now = new Date()

    if (actor.role !== 'ADMIN' && now >= event.startsAt) {
      throw new AppError(409, 'You cannot cancel after the event has started')
    }

    const updated = await tx.registration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED', cancelledAt: now },
      include: withEvent,
    })

    // A freed seat goes to the next person in line
    if (current.status === 'CONFIRMED') {
      await promoteFromWaitlist(tx, event)
    }

    return updated
  }, TX_OPTIONS)
}

export function listMyRegistrations(userId: string) {
  return prisma.registration.findMany({
    where: { userId },
    include: withEvent,
    orderBy: { registeredAt: 'desc' },
  })
}

export async function listRegistrations(query: ListRegistrationsQuery) {
  const and: Prisma.RegistrationWhereInput[] = []

  if (query.eventId) and.push({ eventId: query.eventId })
  if (query.status) and.push({ status: query.status })
  if (query.q) {
    and.push({
      user: {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { email: { contains: query.q, mode: 'insensitive' } },
        ],
      },
    })
  }

  const where: Prisma.RegistrationWhereInput = and.length ? { AND: and } : {}

  const [total, registrations] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      include: withEventAndUser,
      orderBy: [{ registeredAt: 'desc' }, { id: 'asc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ])

  return {
    registrations,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}