import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantEntity } from '../../database/entities/tenant.entity'
import { UserEntity } from '../../database/entities/user.entity'

export interface CreateTenantDto {
  slug: string
  name: string
  language?: string
  timezone?: string
  branding?: Partial<TenantEntity['branding']>
  subscription?: Partial<TenantEntity['subscription']>
  enabledModules?: string[]
}

export interface UpdateTenantDto {
  name?: string
  language?: string
  timezone?: string
  branding?: Partial<TenantEntity['branding']>
  subscription?: Partial<TenantEntity['subscription']>
  enabledModules?: string[]
}

export interface TenantQueryDto {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll(query: TenantQueryDto) {
    const { search, isActive, page = 1, limit = 20 } = query
    const qb = this.tenantRepo.createQueryBuilder('tenant')

    if (search) {
      qb.andWhere('(tenant.name ILIKE :search OR tenant.slug ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    if (isActive !== undefined) {
      qb.andWhere('tenant.isActive = :isActive', { isActive })
    }

    qb.orderBy('tenant.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } })
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`)
    return tenant
  }

  async findBySlug(slug: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { slug } })
    if (!tenant) throw new NotFoundException(`Tenant with slug "${slug}" not found`)
    return tenant
  }

  async create(dto: CreateTenantDto): Promise<TenantEntity> {
    const existing = await this.tenantRepo.findOne({ where: { slug: dto.slug } })
    if (existing) throw new ConflictException(`Tenant slug "${dto.slug}" is already taken`)

    const tenant = this.tenantRepo.create({
      slug: dto.slug,
      name: dto.name,
      language: dto.language ?? 'he',
      timezone: dto.timezone ?? 'Asia/Jerusalem',
      branding: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        companyName: dto.name,
        ...dto.branding,
      },
      subscription: {
        plan: 'basic',
        activeUsers: 0,
        maxUsers: 50,
        modules: dto.enabledModules ?? [],
        billingCycle: 'monthly',
        pricePerUser: 0,
        basePrice: 0,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...dto.subscription,
      },
      enabledModules: dto.enabledModules ?? [],
    })

    return this.tenantRepo.save(tenant)
  }

  async update(id: string, dto: UpdateTenantDto): Promise<TenantEntity> {
    const tenant = await this.findOne(id)

    if (dto.branding) {
      dto.branding = { ...tenant.branding, ...dto.branding }
    }

    if (dto.subscription) {
      dto.subscription = { ...tenant.subscription, ...dto.subscription }
    }

    await this.tenantRepo.update(id, dto)
    return this.findOne(id)
  }

  async toggleActive(id: string): Promise<TenantEntity> {
    const tenant = await this.findOne(id)
    await this.tenantRepo.update(id, { isActive: !tenant.isActive })
    return this.findOne(id)
  }

  async getStats(id: string) {
    const tenant = await this.findOne(id)

    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepo.count({ where: { tenantId: id } }),
      this.userRepo.count({ where: { tenantId: id, isActive: true } }),
    ])

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      isActive: tenant.isActive,
      totalUsers,
      activeUsers,
      maxUsers: tenant.subscription?.maxUsers ?? 0,
      plan: tenant.subscription?.plan ?? 'unknown',
      enabledModules: tenant.enabledModules ?? [],
      createdAt: tenant.createdAt,
    }
  }
}
