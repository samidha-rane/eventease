import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

type VenueInput = {
  name?: string
  address?: string
  capacity?: number
  facilities?: string[]
}

export function listVenues() {
  return prisma.venue.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { events: true } } },
  })
}

export function createVenue(data: Required<Pick<VenueInput, 'name' | 'address' | 'capacity'>> & VenueInput) {
  return prisma.venue.create({
    data: { ...data, facilities: data.facilities ?? [] },
  })
}

export async function updateVenue(id: string, data: VenueInput) {
  const venue = await prisma.venue.findUnique({ where: { id } })
  if (!venue) throw new AppError(404, 'Venue not found')

  // Do not shrink a venue below the size of an event that is still planned
  if (data.capacity !== undefined && data.capacity < venue.capacity) {
    const tooBig = await prisma.event.count({
      where: {
        venueId: id,
        status: { in: ['DRAFT', 'PUBLISHED'] },
        capacity: { gt: data.capacity },
      },
    })
    if (tooBig > 0) {
      throw new AppError(
        409,
        `Cannot reduce capacity: ${tooBig} upcoming event(s) need more seats`,
      )
    }
  }

  return prisma.venue.update({ where: { id }, data })
}

export async function deleteVenue(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } },
  })
  if (!venue) throw new AppError(404, 'Venue not found')

  if (venue._count.events > 0) {
    throw new AppError(
      409,
      `Cannot delete: ${venue._count.events} event(s) are linked to this venue`,
    )
  }

  await prisma.venue.delete({ where: { id } })
}
