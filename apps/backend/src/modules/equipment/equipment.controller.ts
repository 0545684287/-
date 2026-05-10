import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { EquipmentService } from './equipment.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get() findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.equipmentService.findAll(tenantId, query)
  }

  @Get('stats') getStats(@TenantId() tenantId: string) {
    return this.equipmentService.getStats(tenantId)
  }

  @Post() create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.equipmentService.create(tenantId, dto)
  }
}
