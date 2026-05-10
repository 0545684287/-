export interface Employee {
  id: string
  tenantId: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  departmentId: string
  positionId: string
  managerId?: string
  startDate: string
  endDate?: string
  status: 'active' | 'inactive' | 'on_leave'
  contractType: 'permanent' | 'temporary' | 'contractor'
  avatar?: string
  nationalId?: string
  emergencyContact?: EmergencyContact
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface Department {
  id: string
  tenantId: string
  name: string
  code: string
  managerId?: string
  parentDepartmentId?: string
  isActive: boolean
}

export interface Position {
  id: string
  tenantId: string
  title: string
  code: string
  departmentId?: string
  safetyRequirements?: string[]
  requiredCertifications?: string[]
}
