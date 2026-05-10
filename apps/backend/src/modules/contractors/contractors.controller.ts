import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ContractorsService } from './contractors.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('contractors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/contractors')
export class ContractorsController {
  constructor(private readonly service: ContractorsService) {}

  @Get() findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query)
  }

  @Get('active') getActive(@TenantId() tenantId: string) {
    return this.service.getActiveVisitors(tenantId)
  }

  @Post() create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto)
  }

  @Patch(':id/checkout') checkout(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.checkout(tenantId, id)
  }
}
