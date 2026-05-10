import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantEntity } from '../../database/entities/tenant.entity'

export interface TenantRequest extends Request {
  tenantId?: string
  tenant?: TenantEntity
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const tenantSlug =
      req.headers['x-tenant-slug'] as string ||
      this.extractTenantFromHost(req.hostname)

    if (!tenantSlug || req.path.startsWith('/api/v1/auth/system')) {
      return next()
    }

    const tenant = await this.tenantRepo.findOne({
      where: { slug: tenantSlug, isActive: true },
    })

    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }

    req.tenantId = tenant.id
    req.tenant = tenant
    next()
  }

  private extractTenantFromHost(hostname: string): string | null {
    const parts = hostname.split('.')
    if (parts.length >= 3) return parts[0]
    return null
  }
}
