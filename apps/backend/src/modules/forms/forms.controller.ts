import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { FormsService } from './forms.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantId, CurrentUser } from '../../common/decorators/tenant.decorator'

@ApiTags('forms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/forms')
export class FormsController {
  constructor(private readonly service: FormsService) {}

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId)
  }

  @Get('templates')
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query)
  }

  @Post('templates')
  create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto)
  }

  @Put('templates/:id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto)
  }

  @Get('submissions')
  getSubmissions(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.getSubmissions(tenantId, query)
  }

  @Post('templates/:id/submit')
  submit(
    @TenantId() tenantId: string,
    @Param('id') templateId: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.service.submit(tenantId, templateId, body.data, user.id, body.siteId)
  }
}
