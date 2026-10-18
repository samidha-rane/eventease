import type { Prisma } from '../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from '../validators/event'

type Status = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'

const ALL_STATUSES: Status[] = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']
const PUBLIC_STATUSES: Status[] = ['PUBLISHED', 'COMPLETED']

const TRANSITIONS: Record<Status, Status[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['CANCELLED', 'COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
}

const include = {
  category: { select: { id: true, name: true } },
  venue: { select: { id: true, name: true, address: true, capacity: true } },
  _count: {
    select: { registrations: { where: { status: 'CONFIRMED' as const } } },
  },
} satisfies Prisma.EventInclude

type EventWithRelations = Prisma.EventGetPayload<{ include: typeof include }>

function toDto(event: EventWithRelations) {
  const { _count, ...rest } = event
  const registeredCount = _count.registrations
  return {
    ...rest,
    registeredCount,
    seatsLeft: Math.max(0, rest.capacity - registeredCount),
  }
}

type Shape = {
  startsAt: Date
  endsAt: Date
  registrationDeadline: Date
  capacity: number
}

function validateShape(shape: Shape, venueCapacity: number) {
  if (!(shape.endsAt > shape.startsAt)) {
    throw new AppError(400, 'The end time must be after the start time')
  }
  if (shape.registrationDeadline > shape.startsAt) {
    throw new AppError(400, 'The registration deadline cannot be after the event starts')
  }
  if (shape.capacity > venueCapacity) {
    throw new AppError(400, `Capacity cannot exceed the venue capacity (${venueCapacity})`)
  }
}

// One transaction at a time per venue, so two admins cannot double-book it
async function lockVenue(tx: Prisma.TransactionClient, venueId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${venueId}::text))`
}

async function assertNoVenueConflict(
  tx: Prisma.TransactionClient,
  args: { venueId: string; startsAt: Date; endsAt: Date; excludeId?: string },
) {
  const conflict = await tx.event.findFirst({
    where: {
      venueId: args.venueId,
      status: 'PUBLISHED',
      ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
      // Two ranges overlap when each one starts before the other ends
      startsAt: { lt: args.endsAt },
      endsAt: { gt: args.startsAt },
    },
    select: { title: true },
  })
  if (conflict) {
    throw new AppError(409, `The venue is already booked for "${conflict.title}" at that time`)
  }
}

const TX_OPTIONS = { timeout: 15000, maxWait: 10000 }

export async function listEvents(query: ListEventsQuery, isAdmin: boolean) {
  const allowed = isAdmin ? ALL_STATUSES : PUBLIC_STATUSES
  const statuses = query.status ? allowed.filter((s) => s === query.status) : allowed

  const and: Prisma.EventWhereInput[] = [{ status: { in: statuses } }]
  const now = new Date()

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ],
    })
  }
  if (query.categoryId) and.push({ categoryId: query.categoryId })
  if (query.venueId) and.push({ venueId: query.venueId })
  if (query.when === 'upcoming') and.push({ startsAt: { gt: now } })
  if (query.when === 'ongoing') and.push({ startsAt: { lte: now }, endsAt: { gte: now } })
  if (query.when === 'past') and.push({ endsAt: { lt: now } })
  if (query.from) and.push({ startsAt: { gte: query.from } })
  if (query.to) {
    const endOfDay = new Date(query.to)
    endOfDay.setUTCHours(23, 59, 59, 999)
    and.push({ startsAt: { lte: endOfDay } })
  }

  const where: Prisma.EventWhereInput = { AND: and }
  const orderBy = [
    { [query.sort]: query.order } as Prisma.EventOrderByWithRelationInput,
    { id: 'asc' as const }, // keeps page order stable when values tie
  ]

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ])

  return {
    events: events.map(toDto),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getEvent(id: string, isAdmin: boolean) {
  const event = await prisma.event.findUnique({ where: { id }, include })
  const visible = event && (isAdmin || PUBLIC_STATUSES.includes(event.status as Status))
  if (!event || !visible) throw new AppError(404, 'Event not found')
  return toDto(event)
}

export async function createEvent(input: CreateEventInput, userId: string) {
  const [category, venue] = await Promise.all([
    prisma.category.findUnique({ where: { id: input.categoryId } }),
    prisma.venue.findUnique({ where: { id: input.venueId } }),
  ])
  if (!category) throw new AppError(400, 'Category not found')
  if (!venue) throw new AppError(400, 'Venue not found')

  if (input.startsAt <= new Date()) {
    throw new AppError(400, 'The event must start in the future')
  }
  validateShape(input, venue.capacity)

  const created = await prisma.event.create({
    data: { ...input, status: 'DRAFT', createdById: userId },
    include,
  })
  return toDto(created)
}

export async function updateEvent(id: string, input: UpdateEventInput) {
  const current = await prisma.event.findUnique({ where: { id }, include: { venue: true } })
  if (!current) throw new AppError(404, 'Event not found')

  if (current.status === 'CANCELLED' || current.status === 'COMPLETED') {
    throw new AppError(409, 'Cancelled or completed events cannot be edited')
  }

  const merged = {
    startsAt: input.startsAt ?? current.startsAt,
    endsAt: input.endsAt ?? current.endsAt,
    registrationDeadline: input.registrationDeadline ?? current.registrationDeadline,
    capacity: input.capacity ?? current.capacity,
    venueId: input.venueId ?? current.venueId,
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } })
    if (!category) throw new AppError(400, 'Category not found')
  }

  const venue =
    merged.venueId === current.venueId
      ? current.venue
      : await prisma.venue.findUnique({ where: { id: merged.venueId } })
  if (!venue) throw new AppError(400, 'Venue not found')

  if (
    input.startsAt &&
    input.startsAt.getTime() !== current.startsAt.getTime() &&
    input.startsAt <= new Date()
  ) {
    throw new AppError(400, 'The event must start in the future')
  }

  validateShape(merged, venue.capacity)

  // Never shrink below the number of people already confirmed
  if (input.capacity !== undefined) {
    const confirmed = await prisma.registration.count({
      where: { eventId: id, status: 'CONFIRMED' },
    })
    if (input.capacity < confirmed) {
      throw new AppError(409, `Capacity cannot be lower than the ${confirmed} confirmed registrations`)
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    await lockVenue(tx, merged.venueId)
    if (current.status === 'PUBLISHED') {
      await assertNoVenueConflict(tx, {
        venueId: merged.venueId,
        startsAt: merged.startsAt,
        endsAt: merged.endsAt,
        excludeId: id,
      })
    }
    return tx.event.update({ where: { id }, data: input, include })
  }, TX_OPTIONS)

  return toDto(updated)
}

export async function changeStatus(id: string, next: Status) {
  const current = await prisma.event.findUnique({ where: { id } })
  if (!current) throw new AppError(404, 'Event not found')

  if (!TRANSITIONS[current.status as Status].includes(next)) {
    throw new AppError(409, `Cannot change an event from ${current.status} to ${next}`)
  }

  const now = new Date()

  if (next === 'COMPLETED' && current.endsAt > now) {
    throw new AppError(400, 'The event has not finished yet')
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (next === 'PUBLISHED') {
      if (current.startsAt <= now) {
        throw new AppError(400, 'Cannot publish an event that has already started')
      }
      await lockVenue(tx, current.venueId)
      await assertNoVenueConflict(tx, {
        venueId: current.venueId,
        startsAt: current.startsAt,
        endsAt: current.endsAt,
        excludeId: id,
      })
    }

    if (next === 'CANCELLED') {
      // Release every seat held by this event
      await tx.registration.updateMany({
        where: { eventId: id, status: { in: ['CONFIRMED', 'WAITLISTED'] } },
        data: { status: 'CANCELLED', cancelledAt: now },
      })
    }

    return tx.event.update({ where: { id }, data: { status: next }, include })
  }, TX_OPTIONS)

  return toDto(updated)
}

export async function deleteEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  })
  if (!event) throw new AppError(404, 'Event not found')

  if (event._count.registrations > 0) {
    throw new AppError(409, 'This event has registrations. Cancel it instead of deleting it')
  }

  await prisma.event.delete({ where: { id } })
}