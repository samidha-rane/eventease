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