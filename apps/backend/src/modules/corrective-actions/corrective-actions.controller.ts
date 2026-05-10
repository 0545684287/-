import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CorrectiveActionsService } from './corrective-actions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('corrective-actions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/corrective-actions')
export class CorrectiveActionsController {
  constructor(private readonly service: CorrectiveActionsService) {}

  @Get() findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query)
  }

  @Get('stats') getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId)
  }

  @Post() create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto)
  }
}
