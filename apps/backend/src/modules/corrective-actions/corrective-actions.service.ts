import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan, Not } from 'typeorm'
import { CorrectiveActionEntity, ActionStatus } from '../../database/entities/corrective-action.entity'

@Injectable()
export class CorrectiveActionsService {
  constructor(
    @InjectRepository(CorrectiveActionEntity) private repo: Repository<CorrectiveActionEntity>,
  ) {}

  async findAll(tenantId: string, query: any) {
    const qb = this.repo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })

    if (query.status) qb.andWhere('a.status = :status', { status: query.status })
    if (query.severity) qb.andWhere('a.severity = :severity', { severity: query.severity })
    if (query.category) qb.andWhere('a.category = :category', { category: query.category })
    if (query.siteId) qb.andWhere('(a.siteId = :siteId OR a.siteId IS NULL)', { siteId: query.siteId })
    if (query.search) qb.andWhere('a.title ILIKE :s', { s: `%${query.search}%` })

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    qb.skip((page - 1) * limit).take(limit).orderBy('a.createdAt', 'DESC')

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async create(tenantId: string, dto: any) {
    const item = this.repo.create({ ...dto, tenantId, status: ActionStatus.OPEN })
    return this.repo.save(item)
  }

  async update(tenantId: string, id: string, dto: any) {
    const item = await this.repo.findOne({ where: { id, tenantId } })
    if (!item) throw new NotFoundException()
    Object.assign(item, dto)
    return this.repo.save(item)
  }

  async close(tenantId: string, id: string, dto: { resolutionNotes?: string }) {
    const item = await this.repo.findOne({ where: { id, tenantId } })
    if (!item) throw new NotFoundException()
    item.status = ActionStatus.CLOSED
    item.closedAt = new Date()
    item.resolutionNotes = dto.resolutionNotes
    return this.repo.save(item)
  }

  async getStats(tenantId: string) {
    const today = new Date()
    const [total, open, inProgress, closed, overdue] = await Promise.all([
      this.repo.count({ where: { tenantId } }),
      this.repo.count({ where: { tenantId, status: ActionStatus.OPEN } }),
      this.repo.count({ where: { tenantId, status: ActionStatus.IN_PROGRESS } }),
      this.repo.count({ where: { tenantId, status: ActionStatus.CLOSED } }),
      this.repo.count({ where: { tenantId, dueDate: LessThan(today), status: Not(ActionStatus.CLOSED) } }),
    ])
    return { total, open, inProgress, closed, overdue }
  }
}
