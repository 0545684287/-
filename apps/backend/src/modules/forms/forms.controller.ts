import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
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

  @Get() findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query)
  }

  @Get('stats') getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId)
  }

  @Post() create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto)
  }

  @Post(':id/submit') submit(
    @TenantId() tenantId: string,
    @Param('id') formId: string,
    @Body('answers') answers: any[],
    @CurrentUser() user: any,
  ) {
    return this.service.submit(tenantId, formId, answers, user.id)
  }
}
