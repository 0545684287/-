import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
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

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.trainingService.getStats(tenantId)
  }

  @Get('courses')
  getCourses(@TenantId() tenantId: string, @Query() query: any) {
    return this.trainingService.getCourses(tenantId, query)
  }

  @Post('courses')
  createCourse(@TenantId() tenantId: string, @Body() dto: any) {
    return this.trainingService.createCourse(tenantId, dto)
  }

  @Put('courses/:id')
  updateCourse(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.trainingService.updateCourse(tenantId, id, dto)
  }

  @Delete('courses/:id')
  deleteCourse(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.trainingService.deleteCourse(tenantId, id)
  }

  @Get('enrollments')
  getEnrollments(@TenantId() tenantId: string, @Query() query: any) {
    return this.trainingService.getEnrollments(tenantId, query)
  }

  @Post('enroll')
  enroll(@TenantId() tenantId: string, @Body() dto: any) {
    return this.trainingService.enroll(tenantId, dto)
  }

  @Post('enrollments/:id/complete')
  completeEnrollment(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.trainingService.completeEnrollment(tenantId, id, dto)
  }
}
