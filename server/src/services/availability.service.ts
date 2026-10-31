import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

type Input = {
  venueId: string
  startsAt: Date
  endsAt: Date
  excludeEventId?: string
}

export async function checkVenueAvailability(input: Input) {
  const venue = await prisma.venue.findUnique({
    where: { id: input.venueId },
    select: { id: true },
  })
  if (!venue) throw new AppError(404, 'Venue not found')

  const conflicts = await prisma.event.findMany({
    where: {
      venueId: input.venueId,
      status: { in: ['PUBLISHED', 'DRAFT'] },
      ...(input.excludeEventId ? { id: { not: input.excludeEventId } } : {}),
      // Two time ranges overlap when each one starts before the other ends
      startsAt: { lt: input.endsAt },
      endsAt: { gt: input.startsAt },
    },
    orderBy: { startsAt: 'asc' },
    select: { id: true, title: true, startsAt: true, endsAt: true, status: true },
  })

  return {
    // Only published events really occupy a venue
    available: !conflicts.some((event) => event.status === 'PUBLISHED'),
    conflicts,
  }
}