'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const tenant = useAuthStore(s => s.tenant)

  useEffect(() => {
    if (!tenant?.branding) return
    const root = document.documentElement
    if (tenant.branding.primaryColor) {
      const hex = tenant.branding.primaryColor.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      root.style.setProperty('--color-primary', `${r} ${g} ${b}`)
    }
    if (tenant.branding.secondaryColor) {
      const hex = tenant.branding.secondaryColor.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      root.style.setProperty('--color-secondary', `${r} ${g} ${b}`)
    }
    if (tenant.branding.companyName) {
      document.title = `${tenant.branding.companyName} | SafetyWork`
    }
  }, [tenant])

  return <>{children}</>
}
