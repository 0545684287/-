import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLogEntity } from '../../database/entities/audit-log.entity'
import { SUSPICIOUS_PATTERNS } from '../constants/audit.constants'

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  use(req: Request & { tenantId?: string; user?: any }, res: Response, next: NextFunction) {
    const originalSend = res.send.bind(res)

    res.send = (body: any) => {
      if (req.method !== 'GET' && res.statusCode < 400) {
        this.logAction(req, res.statusCode).catch(() => {})
      }
      return originalSend(body)
    }

    next()
  }

  private async logAction(req: Request & { tenantId?: string; user?: any }, statusCode: number) {
    const action = this.resolveAction(req.method)
    const module = this.extractModule(req.path)
    const isSuspicious = SUSPICIOUS_PATTERNS.some(p => req.path.includes(p))

    await this.auditRepo.save({
      tenantId: req.tenantId,
      userId: req.user?.id,
      action,
      module,
      resourceId: req.params?.id,
      resourceType: module,
      after: req.method !== 'DELETE' ? req.body : undefined,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      isSuspicious,
    })
  }

  private resolveAction(method: string): string {
    const map: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    }
    return map[method] || 'action'
  }

  private extractModule(path: string): string {
    const parts = path.split('/').filter(Boolean)
    return parts[2] || 'unknown'
  }
}
