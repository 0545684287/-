import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantEntity } from '../../database/entities/tenant.entity'

export interface UpdateBrandingDto {
  logo?: string
  favicon?: string
  primaryColor?: string
  secondaryColor?: string
  companyName?: string
  customDomain?: string
}

export interface UpdateNotificationSettingsDto {
  emailEnabled?: boolean
  smsEnabled?: boolean
  pushEnabled?: boolean
  whatsappEnabled?: boolean
  incidentAlerts?: boolean
  trainingReminders?: boolean
  equipmentAlerts?: boolean
  dailyDigest?: boolean
  digestTime?: string
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  private async getTenant(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`)
    return tenant
  }

  async getBranding(tenantId: string): Promise<TenantEntity['branding']> {
    const tenant = await this.getTenant(tenantId)
    return tenant.branding ?? {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      companyName: tenant.name,
    }
  }

  async updateBranding(tenantId: string, dto: UpdateBrandingDto): Promise<TenantEntity['branding']> {
    const tenant = await this.getTenant(tenantId)
    const updated = { ...tenant.branding, ...dto }
    await this.tenantRepo.update(tenantId, { branding: updated })
    return updated
  }

  async getModules(tenantId: string): Promise<string[]> {
    const tenant = await this.getTenant(tenantId)
    return tenant.enabledModules ?? []
  }

  async updateModules(tenantId: string, modules: string[]): Promise<string[]> {
    await this.getTenant(tenantId)
    await this.tenantRepo.update(tenantId, { enabledModules: modules })
    return modules
  }

  async getNotificationSettings(tenantId: string): Promise<UpdateNotificationSettingsDto> {
    const tenant = await this.getTenant(tenantId)
    // Notification config is stored inside the tenant subscription metadata
    const meta = (tenant.subscription as any)?.notificationSettings ?? {}
    return {
      emailEnabled: meta.emailEnabled ?? true,
      smsEnabled: meta.smsEnabled ?? false,
      pushEnabled: meta.pushEnabled ?? true,
      whatsappEnabled: meta.whatsappEnabled ?? false,
      incidentAlerts: meta.incidentAlerts ?? true,
      trainingReminders: meta.trainingReminders ?? true,
      equipmentAlerts: meta.equipmentAlerts ?? true,
      dailyDigest: meta.dailyDigest ?? false,
      digestTime: meta.digestTime ?? '08:00',
    }
  }

  async updateNotificationSettings(
    tenantId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<UpdateNotificationSettingsDto> {
    const tenant = await this.getTenant(tenantId)
    const current = (tenant.subscription as any)?.notificationSettings ?? {}
    const updated = { ...current, ...dto }
    const subscription = { ...tenant.subscription, notificationSettings: updated } as any
    await this.tenantRepo.update(tenantId, { subscription })
    return updated
  }

  async getTimezone(tenantId: string): Promise<{ timezone: string; language: string }> {
    const tenant = await this.getTenant(tenantId)
    return { timezone: tenant.timezone, language: tenant.language }
  }

  async updateTimezone(
    tenantId: string,
    dto: { timezone?: string; language?: string },
  ): Promise<{ timezone: string; language: string }> {
    await this.getTenant(tenantId)
    await this.tenantRepo.update(tenantId, dto)
    return this.getTimezone(tenantId)
  }
}
