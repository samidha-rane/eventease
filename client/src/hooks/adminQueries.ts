import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Overview, Venue } from '@/types'

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