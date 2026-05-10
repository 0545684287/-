export interface TenantBranding {
  logo?: string
  favicon?: string
  primaryColor: string
  secondaryColor: string
  companyName: string
  customDomain?: string
}

export interface TenantSubscription {
  plan: 'basic' | 'professional' | 'enterprise'
  activeUsers: number
  maxUsers: number
  modules: string[]
  billingCycle: 'monthly' | 'annual'
  pricePerUser: number
  basePrice: number
  nextBillingDate: string
}

export interface Tenant {
  id: string
  slug: string
  name: string
  branding: TenantBranding
  subscription: TenantSubscription
  isActive: boolean
  language: string
  timezone: string
  createdAt: string
  updatedAt: string
}
