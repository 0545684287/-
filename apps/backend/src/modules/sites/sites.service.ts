import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, TreeRepository } from 'typeorm'
import { SiteEntity } from '../../database/entities/site.entity'
import { UserSiteRoleEntity } from '../../database/entities/user-site-role.entity'
import { UserRole } from '@safetywork/shared'

export interface CreateSiteDto {
  name: string
  code: string
  type?: string
  parentId?: string
  managerId?: string
  address?: string
  city?: string
  phone?: string
  description?: string
}

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(SiteEntity)
    private readonly siteRepo: TreeRepository<SiteEntity>,
    @InjectRepository(UserSiteRoleEntity)
    private readonly siteRoleRepo: Repository<UserSiteRoleEntity>,
  ) {}

  async getTree(tenantId: string): Promise<SiteEntity[]> {
    const roots = await this.siteRepo.find({
      where: { tenantId, parentId: null as any, isActive: true },
      order: { name: 'ASC' },
    })
    return Promise.all(roots.map(r => this.siteRepo.findDescendantsTree(r)))
  }

  async getFlat(tenantId: string): Promise<SiteEntity[]> {
    return this.siteRepo.find({ where: { tenantId, isActive: true }, order: { level: 'ASC', name: 'ASC' } })
  }

  async findOne(tenantId: string, id: string): Promise<SiteEntity> {
    const site = await this.siteRepo.findOne({ where: { id, tenantId } })
    if (!site) throw new NotFoundException('Site not found')
    return site
  }

  async getDescendantIds(tenantId: string, siteId: string): Promise<string[]> {
    const site = await this.findOne(tenantId, siteId)
    const descendants = await this.siteRepo.findDescendants(site)
    return descendants.map(d => d.id)
  }

  async create(tenantId: string, dto: CreateSiteDto): Promise<SiteEntity> {
    let parent: SiteEntity | null = null
    if (dto.parentId) {
      parent = await this.findOne(tenantId, dto.parentId)
    }

    const site = this.siteRepo.create({
      ...dto,
      tenantId,
      parent: parent || undefined,
      parentId: dto.parentId || undefined,
    })
    return this.siteRepo.save(site)
  }

  async update(tenantId: string, id: string, dto: Partial<CreateSiteDto>): Promise<SiteEntity> {
    await this.findOne(tenantId, id)
    await this.siteRepo.update({ id, tenantId }, dto as any)
    return this.findOne(tenantId, id)
  }

  async deactivate(tenantId: string, id: string): Promise<{ success: boolean }> {
    await this.findOne(tenantId, id)
    await this.siteRepo.update({ id, tenantId }, { isActive: false })
    return { success: true }
  }

  // User–Site roles
  async assignUserToSite(tenantId: string, userId: string, siteId: string, role: UserRole) {
    await this.findOne(tenantId, siteId)
    const existing = await this.siteRoleRepo.findOne({ where: { tenantId, userId, siteId } })
    if (existing) {
      await this.siteRoleRepo.update(existing.id, { role, isActive: true })
      return this.siteRoleRepo.findOne({ where: { id: existing.id } })
    }
    return this.siteRoleRepo.save({ tenantId, userId, siteId, role })
  }

  async removeUserFromSite(tenantId: string, userId: string, siteId: string) {
    await this.siteRoleRepo.update({ tenantId, userId, siteId }, { isActive: false })
    return { success: true }
  }

  async getUserSites(tenantId: string, userId: string, userRole: UserRole): Promise<string[]> {
    // System/client admins see all sites
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.CLIENT_ADMIN) {
      const all = await this.siteRepo.find({ where: { tenantId, isActive: true } })
      return all.map(s => s.id)
    }

    const assignments = await this.siteRoleRepo.find({
      where: { tenantId, userId, isActive: true },
    })

    // Expand each assigned site to include all its descendants
    const siteIds = new Set<string>()
    for (const a of assignments) {
      const descendants = await this.getDescendantIds(tenantId, a.siteId)
      descendants.forEach(id => siteIds.add(id))
    }
    return Array.from(siteIds)
  }

  async getSiteUsers(tenantId: string, siteId: string) {
    return this.siteRoleRepo.find({ where: { tenantId, siteId, isActive: true } })
  }

  async getStats(tenantId: string) {
    const all = await this.siteRepo.find({ where: { tenantId } })
    return {
      total: all.length,
      active: all.filter(s => s.isActive).length,
      byType: all.reduce((acc: any, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1
        return acc
      }, {}),
    }
  }
}
