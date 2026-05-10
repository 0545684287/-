import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, FindManyOptions } from 'typeorm'
import { AuditLogEntity } from '../../database/entities/audit-log.entity'

export interface AuditLogFilters {
  userId?: string
  module?: string
  action?: string
  resourceType?: string
  resourceId?: string
  startDate?: string
  endDate?: string
  isSuspicious?: boolean
  page?: number
  limit?: number
}

export interface PaginatedAuditLogs {
  data: AuditLogEntity[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async findAll(tenantId: string, filters: AuditLogFilters): Promise<PaginatedAuditLogs> {
    const {
      userId,
      module,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      isSuspicious,
      page = 1,
      limit = 50,
    } = filters

    const qb = this.auditRepo
      .createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId })

    if (userId) {
      qb.andWhere('log.userId = :userId', { userId })
    }

    if (module) {
      qb.andWhere('log.module = :module', { module })
    }

    if (action) {
      qb.andWhere('log.action = :action', { action })
    }

    if (resourceType) {
      qb.andWhere('log.resourceType = :resourceType', { resourceType })
    }

    if (resourceId) {
      qb.andWhere('log.resourceId = :resourceId', { resourceId })
    }

    if (isSuspicious !== undefined) {
      qb.andWhere('log.isSuspicious = :isSuspicious', { isSuspicious })
    }

    if (startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate: new Date(startDate) })
    }

    if (endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: new Date(endDate) })
    }

    qb.orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findSuspicious(tenantId: string): Promise<PaginatedAuditLogs> {
    return this.findAll(tenantId, { isSuspicious: true, limit: 100 })
  }

  async markSuspicious(id: string, tenantId: string): Promise<AuditLogEntity | null> {
    await this.auditRepo.update({ id, tenantId }, { isSuspicious: true })
    return this.auditRepo.findOne({ where: { id, tenantId } })
  }
}
