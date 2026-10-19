export type Role = 'ADMIN' | 'PARTICIPANT'

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
}

export type Category = {
  id: string
  name: string
  description: string | null
  _count?: { events: number }
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'

export type EventItem = {
  id: string
  title: string
  description: string
  bannerUrl: string | null
  startsAt: string
  endsAt: string
  registrationDeadline: string
  capacity: number
  status: EventStatus
  category: { id: string; name: string }
  venue: { id: string; name: string; address: string; capacity: number }
  registeredCount: number
  seatsLeft: number
}

export type RegistrationStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED'

export type Registration = {
  id: string
  status: RegistrationStatus
  ticketCode: string
  registeredAt: string
  cancelledAt: string | null
  event: {
    id: string
    title: string
    startsAt: string
    endsAt: string
    status: EventStatus
    venue: { name: string; address: string }
  }
}

export type PageMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}


export type Venue = {
  id: string
  name: string
  address: string
  capacity: number
  facilities: string[]
  _count?: { events: number }
}

export type Overview = {
  totals: {
    events: number
    participants: number
    registrations: number
    upcomingEvents: number
  }
  registrationsOverTime: { date: string; count: number }[]
  categoryBreakdown: { id: string; name: string; events: number }[]
  feedback: { count: number; averageRating: number | null }
  recentRegistrations: {
    id: string
    status: RegistrationStatus
    registeredAt: string
    user: { name: string; email: string }
    event: { id: string; title: string }
  }[]
  upcomingEvents: {
    id: string
    title: string
    startsAt: string
    capacity: number
    venue: { name: string }
    registeredCount: number
  }[]
}

export type AdminRegistration = {
  id: string
  status: RegistrationStatus
  ticketCode: string
  registeredAt: string
  user: { id: string; name: string; email: string; phone: string | null }
  event: {
    id: string
    title: string
    startsAt: string
    endsAt: string
    status: EventStatus
    venue: { name: string; address: string }
  }
}

export type FeedbackItem = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  event: { id: string; title: string }
}

export type ParticipantRow = {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  _count: { registrations: number }
}

export type ParticipantDetail = {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  registrations: {
    id: string
    status: RegistrationStatus
    registeredAt: string
    checkedInAt: string | null
    event: { id: string; title: string; startsAt: string; status: EventStatus }
  }[]
  feedback: {
    id: string
    rating: number
    comment: string | null
    event: { id: string; title: string }
  }[]
}