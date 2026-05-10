import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { HrService } from './hr.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantId } from '../../common/decorators/tenant.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('hr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('employees')
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.findAllEmployees(tenantId, query)
  }

  @Get('employees/stats')
  getStats(@TenantId() tenantId: string) {
    return this.hrService.getStats(tenantId)
  }

  @Get('employees/:id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.hrService.findOneEmployee(tenantId, id)
  }

  @Post('employees')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.SYSTEM_ADMIN)
  create(@TenantId() tenantId: string, @Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(tenantId, dto)
  }

  @Put('employees/:id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.SYSTEM_ADMIN)
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.hrService.updateEmployee(tenantId, id, dto)
  }

  @Delete('employees/:id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.hrService.deleteEmployee(tenantId, id)
  }

  @Get('departments')
  getDepartments(@TenantId() tenantId: string) {
    return this.hrService.findAllDepartments(tenantId)
  }

  @Post('departments')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  createDepartment(@TenantId() tenantId: string, @Body() dto: any) {
    return this.hrService.createDepartment(tenantId, dto)
  }
}
