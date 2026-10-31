import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdminRegistration,
  FeedbackItem,
  Overview,
  PageMeta,
  ParticipantDetail,
  ParticipantRow,
  Venue,
} from '@/types'

export function useVenues() {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async () => (await api<{ venues: Venue[] }>('/venues')).venues,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/analytics/overview'),
  })
}

export function useAdminRegistrations(params: string) {
  return useQuery({
    queryKey: ['admin-registrations', params],
    queryFn: () =>
      api<{ registrations: AdminRegistration[]; meta: PageMeta }>(`/registrations?${params}`),
    placeholderData: keepPreviousData,
  })
}

export function useFeedback(params: string) {
  return useQuery({
    queryKey: ['feedback', params],
    queryFn: () =>
      api<{ feedback: FeedbackItem[]; averageRating: number | null; meta: PageMeta }>(
        `/feedback?${params}`,
      ),
    placeholderData: keepPreviousData,
  })
}

export function useParticipants(params: string) {
  return useQuery({
    queryKey: ['participants', params],
    queryFn: () =>
      api<{ participants: ParticipantRow[]; meta: PageMeta }>(`/participants?${params}`),
    placeholderData: keepPreviousData,
  })
}

export function useParticipant(id: string) {
  return useQuery({
    queryKey: ['participant', id],
    queryFn: async () => (await api<{ participant: ParticipantDetail }>(`/participants/${id}`)).participant,
  })
}

export type Conflict = {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: 'DRAFT' | 'PUBLISHED'
}

type AvailabilityParams = {
  venueId: string
  startsAt: string
  endsAt: string
  excludeEventId?: string
}

export function useAvailability(params: AvailabilityParams | null) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => {
      if (!params) throw new Error('Missing availability parameters')
      const search = new URLSearchParams({
        venueId: params.venueId,
        startsAt: params.startsAt,
        endsAt: params.endsAt,
      })
      if (params.excludeEventId) search.set('excludeEventId', params.excludeEventId)
      return api<{ available: boolean; conflicts: Conflict[] }>(
        `/venues/availability?${search.toString()}`,
      )
    },
    enabled: params !== null,
    staleTime: 0,
  })
}