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
    // If the server is waking up, keep trying instead of showing "logged out"
    retry: (count, error) =>
      !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 6000),
  })

  const value: AuthValue = {
    user: data ?? null,
    loading: isLoading,
        async login(input) {
      const result = await api<{ user: User }>('/auth/login', { method: 'POST', body: input })
      // Forget anything left over from a previous person on this browser
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' })
      queryClient.setQueryData(['me'], result.user)
      return result.user
    },
    async register(input) {
      const result = await api<{ user: User }>('/auth/register', { method: 'POST', body: input })
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' })
      queryClient.setQueryData(['me'], result.user)
      return result.user
    },
    async logout() {
      try {
        await api('/auth/logout', { method: 'POST' })
      } finally {
        // Update the screen straight away, with no refresh needed
        await queryClient.cancelQueries({ queryKey: ['me'] })
        queryClient.setQueryData(['me'], null)
        // Remove the logged-out person's tickets and admin data from memory
        queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' })
      }
    },

  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}