import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  language: string
  tenantId: string
}

interface AuthState {
  user: AuthUser | null
  tenantSlug: string | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (data: { user: AuthUser; accessToken: string; refreshToken: string; tenantSlug: string }) => void
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenantSlug: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: ({ user, accessToken, refreshToken, tenantSlug }) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('tenantSlug', tenantSlug)
        set({ user, accessToken, refreshToken, tenantSlug, isAuthenticated: true })
      },
      logout: () => {
        localStorage.clear()
        set({ user: null, accessToken: null, refreshToken: null, tenantSlug: null, isAuthenticated: false })
      },
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, tenantSlug: state.tenantSlug }) },
  ),
)
