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