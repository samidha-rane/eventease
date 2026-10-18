import type { Registration } from '@/types'

// Maps event id to your registration status, ignoring cancelled ones
export function registrationMap(registrations: Registration[] | undefined) {
  const map = new Map<string, 'CONFIRMED' | 'WAITLISTED'>()
  for (const item of registrations ?? []) {
    if (item.status !== 'CANCELLED') map.set(item.event.id, item.status)
  }
  return map
}