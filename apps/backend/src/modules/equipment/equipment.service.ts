import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { EquipmentEntity, EquipmentStatus } from '../../database/entities/equipment.entity'

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(EquipmentEntity) private repo: Repository<EquipmentEntity>,
  ) {}

  async findAll(tenantId: string, query: any) {
    const qb = this.repo.createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })

    if (query.status) qb.andWhere('e.status = :status', { status: query.status })
    if (query.type) qb.andWhere('e.type = :type', { type: query.type })
    if (query.siteId) qb.andWhere('(e.siteId = :siteId OR e.siteId IS NULL)', { siteId: query.siteId })
    if (query.search) qb.andWhere('(e.name ILIKE :s OR e.serialNumber ILIKE :s)', { s: `%${query.search}%` })

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    qb.skip((page - 1) * limit).take(limit).orderBy('e.createdAt', 'DESC')

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
    const [total, operational, maintenance, faulty, overdueInspection] = await Promise.all([
      this.repo.count({ where: { tenantId } }),
      this.repo.count({ where: { tenantId, status: EquipmentStatus.OPERATIONAL } }),
      this.repo.count({ where: { tenantId, status: EquipmentStatus.MAINTENANCE } }),
      this.repo.count({ where: { tenantId, status: EquipmentStatus.FAULTY } }),
      this.repo.count({ where: { tenantId, nextInspectionDate: LessThan(today) } }),
    ])
    return { total, operational, maintenance, faulty, overdueInspection }
  }
}
