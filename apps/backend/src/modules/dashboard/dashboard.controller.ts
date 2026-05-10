import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard statistics for the tenant' })
  getStats(@TenantId() tenantId: string) {
    return this.dashboardService.getStats(tenantId)
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get the last 10 audit log entries for the tenant' })
  getRecentActivity(@TenantId() tenantId: string) {
    return this.dashboardService.getRecentActivity(tenantId)
  }

  @Get('safety-score')
  @ApiOperation({ summary: 'Get the calculated safety score (0-100) for the tenant' })
  getSafetyScore(@TenantId() tenantId: string) {
    return this.dashboardService.getSafetyScore(tenantId)
  }
}
