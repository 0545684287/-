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

interface TenantBranding {
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  companyName?: string
  customDomain?: string
}

interface Tenant {
  id?: string
  slug: string
  branding?: TenantBranding
}

interface AuthState {
  user: AuthUser | null
  tenant: Tenant | null
  tenantSlug: string | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (data: { user: AuthUser; accessToken: string; refreshToken: string; tenantSlug: string }) => void
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
  updateTenant: (data: Partial<Tenant>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      tenantSlug: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: ({ user, accessToken, refreshToken, tenantSlug }) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          localStorage.setItem('tenantSlug', tenantSlug)
        }
        set({
          user,
          accessToken,
          refreshToken,
          tenantSlug,
          tenant: { slug: tenantSlug },
          isAuthenticated: true,
        })
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.clear()
        set({ user: null, accessToken: null, refreshToken: null, tenantSlug: null, tenant: null, isAuthenticated: false })
      },
      updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
      updateTenant: (data) => set((s) => ({ tenant: s.tenant ? { ...s.tenant, ...data } : (data as Tenant) })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, tenantSlug: state.tenantSlug, tenant: state.tenant }),
    },
  ),
)
