import { UserRole } from './roles'

export interface User {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  departmentId?: string
  employeeId?: string
  phone?: string
  avatar?: string
  isActive: boolean
  twoFactorEnabled: boolean
  language: string
  lastLoginAt?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginDto {
  email: string
  password: string
  tenantSlug?: string
  twoFactorCode?: string
}
