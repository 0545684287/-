export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  CLIENT_ADMIN = 'client_admin',
  DEPARTMENT_MANAGER = 'department_manager',
  EMPLOYEE = 'employee',
  WAREHOUSE = 'warehouse',
  SECURITY = 'security',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SYSTEM_ADMIN]: 100,
  [UserRole.CLIENT_ADMIN]: 80,
  [UserRole.DEPARTMENT_MANAGER]: 60,
  [UserRole.EMPLOYEE]: 40,
  [UserRole.WAREHOUSE]: 40,
  [UserRole.SECURITY]: 40,
}

export const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  hr: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER],
  training: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE],
  equipment: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.WAREHOUSE],
  corrective_actions: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER],
  contractors: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.SECURITY],
  forms: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE],
  dashboard: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER],
  settings: [UserRole.SYSTEM_ADMIN, UserRole.CLIENT_ADMIN],
}
