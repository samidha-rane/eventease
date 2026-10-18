import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Category, EventItem, PageMeta, Registration } from '@/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api<{ categories: Category[] }>('/categories')).categories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useEvents(params: string) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => api<{ events: EventItem[]; meta: PageMeta }>(`/events?${params}`),
    placeholderData: keepPreviousData,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => (await api<{ event: EventItem }>(`/events/${id}`)).event,
    enabled: Boolean(id),
  })
}

export function useMyRegistrations(enabled: boolean) {
  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () =>
      (await api<{ registrations: Registration[] }>('/registrations/me')).registrations,
    enabled,
  })
}