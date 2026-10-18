import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import type { User } from '@/types'

type RegisterInput = {
  name: string
  email: string
  phone?: string
  password: string
}

type AuthValue = {
  user: User | null
  loading: boolean
  login: (input: { email: string; password: string }) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return (await api<{ user: User }>('/auth/me')).user
      } catch (error) {
        // 401 simply means "not logged in"
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const value: AuthValue = {
    user: data ?? null,
    loading: isLoading,
    async login(input) {
      const result = await api<{ user: User }>('/auth/login', { method: 'POST', body: input })
      queryClient.setQueryData(['me'], result.user)
      return result.user
    },
    async register(input) {
      const result = await api<{ user: User }>('/auth/register', { method: 'POST', body: input })
      queryClient.setQueryData(['me'], result.user)
      return result.user
    },
    async logout() {
      await api('/auth/logout', { method: 'POST' })
      queryClient.clear()
      queryClient.setQueryData(['me'], null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}