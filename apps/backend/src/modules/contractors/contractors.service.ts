import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { ContractorEntity, ContractorStatus } from '../../database/entities/contractor.entity'

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(ContractorEntity) private repo: Repository<ContractorEntity>,
  ) {}

  async findAll(tenantId: string, query: any) {
    const qb = this.repo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })

    if (query.status) qb.andWhere('c.status = :status', { status: query.status })
    if (query.siteId) qb.andWhere('(c.siteId = :siteId OR c.siteId IS NULL)', { siteId: query.siteId })
    if (query.search) qb.andWhere('(c.companyName ILIKE :s OR c.contactPerson ILIKE :s)', { s: `%${query.search}%` })

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    qb.skip((page - 1) * limit).take(limit).orderBy('c.createdAt', 'DESC')

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async create(tenantId: string, dto: any) {
    const item = this.repo.create({ ...dto, tenantId })
    return this.repo.save(item)
  }

  async update(tenantId: string, id: string, dto: any) {
    const item = await this.repo.findOne({ where: { id, tenantId } })
    if (!item) throw new NotFoundException()
    Object.assign(item, dto)
    return this.repo.save(item)
  }

  async remove(tenantId: string, id: string) {
    const item = await this.repo.findOne({ where: { id, tenantId } })
    if (!item) throw new NotFoundException()
    return this.repo.remove(item)
  }

  async getStats(tenantId: string) {
    const today = new Date()
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)

    const [total, active, pendingApproval, expired, expiringLicenses] = await Promise.all([
      this.repo.count({ where: { tenantId } }),
      this.repo.count({ where: { tenantId, status: ContractorStatus.ACTIVE } }),
      this.repo.count({ where: { tenantId, status: ContractorStatus.PENDING_APPROVAL } }),
      this.repo.count({ where: { tenantId, status: ContractorStatus.EXPIRED } }),
      this.repo.count({ where: { tenantId, licenseExpiryDate: LessThan(thirtyDays) } }),
    ])
    return { total, active, pendingApproval, expired, expiringLicenses }
  }

  getActiveVisitors(tenantId: string) {
    return this.repo.find({ where: { tenantId, status: ContractorStatus.ACTIVE } })
  }
}
