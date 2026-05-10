import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
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

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.equipmentService.getStats(tenantId)
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.equipmentService.findAll(tenantId, query)
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.equipmentService.create(tenantId, dto)
  }

  @Put(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.equipmentService.update(tenantId, id, dto)
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.equipmentService.remove(tenantId, id)
  }
}
