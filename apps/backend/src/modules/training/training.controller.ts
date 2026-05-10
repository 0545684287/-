import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { TrainingService } from './training.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get() findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.trainingService.findAll(tenantId, query)
  }

  @Get('stats') getStats(@TenantId() tenantId: string) {
    return this.trainingService.getStats(tenantId)
  }

  @Post() create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.trainingService.create(tenantId, dto)
  }
}
