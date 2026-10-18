import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import type { ListParticipantsQuery } from '../validators/feedback'

export async function listParticipants(query: ListParticipantsQuery) {
  const where: Prisma.UserWhereInput = {
    role: 'PARTICIPANT',
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { email: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [total, participants] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { registrations: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ])

  return {
    participants,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getParticipant(id: string) {
  const participant = await prisma.user.findFirst({
    where: { id, role: 'PARTICIPANT' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      registrations: {
        orderBy: { registeredAt: 'desc' },
        select: {
          id: true,
          status: true,
          registeredAt: true,
          checkedInAt: true,
          event: { select: { id: true, title: true, startsAt: true, status: true } },
        },
      },
      feedback: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          event: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!participant) throw new AppError(404, 'Participant not found')
  return participant
}