import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
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

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId)
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query)
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto)
  }

  @Put(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto)
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id)
  }
}
