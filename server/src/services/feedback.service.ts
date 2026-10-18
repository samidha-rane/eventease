import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import type { ListFeedbackQuery } from '../validators/feedback'

export async function createFeedback(
  eventId: string,
  userId: string,
  input: { rating: number; comment?: string },
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || !['PUBLISHED', 'COMPLETED'].includes(event.status)) {
    throw new AppError(404, 'Event not found')
  }

  if (event.endsAt > new Date()) {
    throw new AppError(409, 'You can leave feedback after the event has ended')
  }

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  })
  if (!registration || registration.status !== 'CONFIRMED') {
    throw new AppError(403, 'Only confirmed attendees can leave feedback')
  }

  try {
    return await prisma.feedback.create({
      data: { eventId, userId, rating: input.rating, comment: input.comment || null },
      select: { id: true, rating: true, comment: true, createdAt: true, eventId: true },
    })
  } catch (error) {
    // The database also blocks a second feedback, even if two arrive together
    if ((error as { code?: string }).code === 'P2002') {
      throw new AppError(409, 'You have already left feedback for this event')
    }
    throw error
  }
}

export async function listFeedback(query: ListFeedbackQuery) {
  const where: Prisma.FeedbackWhereInput = query.eventId ? { eventId: query.eventId } : {}

  const [total, feedback, stats] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.feedback.aggregate({ where, _avg: { rating: true } }),
  ])

  const average = stats._avg.rating

  return {
    feedback,
    averageRating: average === null ? null : Math.round(average * 100) / 100,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}