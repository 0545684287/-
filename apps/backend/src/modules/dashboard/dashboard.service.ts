import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantEntity } from '../../database/entities/tenant.entity'
import { UserEntity } from '../../database/entities/user.entity'
import { AuditLogEntity } from '../../database/entities/audit-log.entity'
import { EmployeeEntity } from '../../database/entities/employee.entity'

export interface DashboardStats {
  employees: {
    total: number
    active: number
    onLeave: number
    inactive: number
  }
  users: {
    total: number
    active: number
  }
  incidents: {
    total: number
    open: number
    resolved: number
  }
  equipment: {
    total: number
    operational: number
    maintenance: number
    outOfService: number
  }
  trainings: {
    total: number
    upcoming: number
    completed: number
    overdue: number
  }
  forms: {
    total: number
    pending: number
    submitted: number
  }
}

export interface SafetyScore {
  score: number
  breakdown: {
    incidentRate: number
    trainingCompliance: number
    equipmentCompliance: number
    formCompletion: number
  }
  trend: 'up' | 'down' | 'stable'
  calculatedAt: Date
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
  ) {}

  private async assertTenant(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`)
    return tenant
  }

  async getStats(tenantId: string): Promise<DashboardStats> {
    await this.assertTenant(tenantId)

    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      inactiveEmployees,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.employeeRepo.count({ where: { tenantId } }),
      this.employeeRepo.count({ where: { tenantId, status: 'active' } }),
      this.employeeRepo.count({ where: { tenantId, status: 'on_leave' } }),
      this.employeeRepo.count({ where: { tenantId, status: 'inactive' } }),
      this.userRepo.count({ where: { tenantId } }),
      this.userRepo.count({ where: { tenantId, isActive: true } }),
    ])

    // TODO: Replace stub counts below with real repository queries once
    // IncidentEntity, EquipmentEntity, TrainingEntity and FormEntity are created.
    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        inactive: inactiveEmployees,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      incidents: {
        total: 0,
        open: 0,
        resolved: 0,
      },
      equipment: {
        total: 0,
        operational: 0,
        maintenance: 0,
        outOfService: 0,
      },
      trainings: {
        total: 0,
        upcoming: 0,
        completed: 0,
        overdue: 0,
      },
      forms: {
        total: 0,
        pending: 0,
        submitted: 0,
      },
    }
  }

  async getRecentActivity(tenantId: string): Promise<AuditLogEntity[]> {
    await this.assertTenant(tenantId)

    return this.auditRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 10,
    })
  }

  async getSafetyScore(tenantId: string): Promise<SafetyScore> {
    await this.assertTenant(tenantId)

    // TODO: Compute a real score once incident / training / equipment / form
    // data is available. The formula below is a placeholder that weights:
    //   - Incident rate:          25 %  (fewer incidents → higher score)
    //   - Training compliance:    35 %  (% of employees up-to-date with training)
    //   - Equipment compliance:   20 %  (% of equipment within maintenance schedule)
    //   - Form completion rate:   20 %  (% of required forms submitted on time)
    const incidentRate = 100         // placeholder — no incidents yet
    const trainingCompliance = 100   // placeholder — no training data yet
    const equipmentCompliance = 100  // placeholder — no equipment data yet
    const formCompletion = 100       // placeholder — no form data yet

    const score = Math.round(
      incidentRate * 0.25 +
      trainingCompliance * 0.35 +
      equipmentCompliance * 0.20 +
      formCompletion * 0.20,
    )

    return {
      score,
      breakdown: {
        incidentRate,
        trainingCompliance,
        equipmentCompliance,
        formCompletion,
      },
      trend: 'stable',
      calculatedAt: new Date(),
    }
  }
}
