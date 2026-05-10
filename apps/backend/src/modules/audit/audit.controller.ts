import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuditService, AuditLogFilters } from './audit.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantId } from '../../common/decorators/tenant.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
@Controller('v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Query audit log entries for the tenant' })
  findAll(@TenantId() tenantId: string, @Query() filters: AuditLogFilters) {
    return this.auditService.findAll(tenantId, filters)
  }

  @Get('suspicious')
  @ApiOperation({ summary: 'Get suspicious audit log entries for the tenant' })
  findSuspicious(@TenantId() tenantId: string) {
    return this.auditService.findSuspicious(tenantId)
  }

  @Patch('logs/:id/mark-suspicious')
  @ApiOperation({ summary: 'Manually mark an audit log entry as suspicious' })
  markSuspicious(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.auditService.markSuspicious(id, tenantId)
  }
}
