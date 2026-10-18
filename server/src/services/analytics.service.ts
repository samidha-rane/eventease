import { prisma } from '../lib/prisma'

const DAY = 24 * 60 * 60 * 1000

export async function getOverview() {
  const now = new Date()
  const since = new Date(now.getTime() - 30 * DAY)

  const [
    totalEvents,
    totalParticipants,
    totalRegistrations,
    upcomingCount,
    categories,
    trendRows,
    checkedIn,
    confirmedPast,
    ratings,
    recentRegistrations,
    upcomingEvents,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.user.count({ where: { role: 'PARTICIPANT' } }),
    prisma.registration.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.event.count({ where: { status: 'PUBLISHED', startsAt: { gt: now } } }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, _count: { select: { events: true } } },
    }),
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "registeredAt") AS day, COUNT(*)::int AS count
      FROM "Registration"
      WHERE "registeredAt" >= ${since} AND status <> 'CANCELLED'
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.registration.count({ where: { checkedInAt: { not: null } } }),
    prisma.registration.count({
      where: { status: 'CONFIRMED', event: { endsAt: { lt: now } } },
    }),
    prisma.feedback.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.registration.findMany({
      orderBy: { registeredAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        registeredAt: true,
        user: { select: { name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    }),
    prisma.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gt: now } },
      orderBy: { startsAt: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        startsAt: true,
        capacity: true,
        venue: { select: { name: true } },
        _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
      },
    }),
  ])

  // Fill in days with zero registrations so charts have no gaps
  const byDay = new Map(trendRows.map((row) => [row.day.toISOString().slice(0, 10), row.count]))
  const registrationsOverTime = Array.from({ length: 31 }, (_, i) => {
    const date = new Date(since.getTime() + i * DAY).toISOString().slice(0, 10)
    return { date, count: byDay.get(date) ?? 0 }
  })

  const average = ratings._avg.rating

  return {
    totals: {
      events: totalEvents,
      participants: totalParticipants,
      registrations: totalRegistrations,
      upcomingEvents: upcomingCount,
    },
    registrationsOverTime,
    categoryBreakdown: categories.map((c) => ({
      id: c.id,
      name: c.name,
      events: c._count.events,
    })),
    attendance: {
      checkedIn,
      confirmedForPastEvents: confirmedPast,
      rate: confirmedPast === 0 ? null : Math.round((checkedIn / confirmedPast) * 100),
    },
    feedback: {
      count: ratings._count,
      averageRating: average === null ? null : Math.round(average * 100) / 100,
    },
    recentRegistrations,
    upcomingEvents: upcomingEvents.map(({ _count, ...event }) => ({
      ...event,
      registeredCount: _count.registrations,
    })),
  }
}