import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

const TX_OPTIONS = { timeout: 15000, maxWait: 10000 }

const include = {
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
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.RegistrationInclude

async function lockEvent(tx: Prisma.TransactionClient, eventId: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE
  `
  if (rows.length === 0) throw new AppError(404, 'Event not found')
}

export async function confirmWaitlisted(registrationId: string) {
  const found = await prisma.registration.findUnique({ where: { id: registrationId } })
  if (!found) throw new AppError(404, 'Registration not found')

  return prisma.$transaction(async (tx) => {
    await lockEvent(tx, found.eventId)

    const current = await tx.registration.findUnique({ where: { id: registrationId } })
    if (!current) throw new AppError(404, 'Registration not found')
    if (current.status !== 'WAITLISTED') {
      throw new AppError(409, 'Only waitlisted registrations can be confirmed')
    }

    const event = await tx.event.findUniqueOrThrow({ where: { id: current.eventId } })
    if (event.status !== 'PUBLISHED') {
      throw new AppError(409, 'This event is not open for registration')
    }

    const confirmed = await tx.registration.count({
      where: { eventId: event.id, status: 'CONFIRMED' },
    })
    if (confirmed >= event.capacity) {
      throw new AppError(
        409,
        'No free seat. Cancel another registration or raise the event capacity first',
      )
    }

    return tx.registration.update({
      where: { id: registrationId },
      data: { status: 'CONFIRMED' },
      include,
    })
  }, TX_OPTIONS)
}

export async function checkIn(registrationId: string) {
  const found = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  })
  if (!found) throw new AppError(404, 'Registration not found')
  if (found.status !== 'CONFIRMED') {
    throw new AppError(409, 'Only confirmed registrations can be checked in')
  }
  if (!['PUBLISHED', 'COMPLETED'].includes(found.event.status)) {
    throw new AppError(409, 'This event is not running')
  }
  if (found.checkedInAt) throw new AppError(409, 'Already checked in')

  // The checkedInAt: null condition stops two simultaneous check-ins
  const result = await prisma.registration.updateMany({
    where: { id: registrationId, status: 'CONFIRMED', checkedInAt: null },
    data: { checkedInAt: new Date() },
  })
  if (result.count === 0) throw new AppError(409, 'Already checked in')

  return prisma.registration.findUniqueOrThrow({ where: { id: registrationId }, include })
}

export function listMyFeedback(userId: string) {
  return prisma.feedback.findMany({
    where: { userId },
    select: { eventId: true, rating: true, comment: true },
  })
}