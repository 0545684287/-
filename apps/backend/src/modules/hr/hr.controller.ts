import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Res
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { Response } from 'express'
import { HrService } from './hr.service'
import { HrImportService } from './hr-import.service'
import { HrExportService } from './hr-export.service'
import { StorageService } from '../storage/storage.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { CreatePositionDto } from './dto/create-position.dto'
import { EmployeeQueryDto } from './dto/employee-query.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantId, CurrentUser } from '../../common/decorators/tenant.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('hr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/hr')
export class HrController {
  constructor(
    private readonly hrService: HrService,
    private readonly importService: HrImportService,
    private readonly exportService: HrExportService,
    private readonly storageService: StorageService,
  ) {}

  // ── Employees ──────────────────────────────────────────────

  @Get('employees')
  findAll(@TenantId() tenantId: string, @Query() query: EmployeeQueryDto) {
    return this.hrService.findAllEmployees(tenantId, query)
  }

  @Get('employees/stats')
  getStats(@TenantId() tenantId: string) {
    return this.hrService.getStats(tenantId)
  }

  @Get('employees/export')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  async exportEmployees(@TenantId() tenantId: string, @Query() query: EmployeeQueryDto, @Res() res: Response) {
    const { data } = await this.hrService.findAllEmployees(tenantId, { ...query, limit: 10000 })
    const buffer = await this.exportService.exportEmployeesToExcel(data)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="employees.xlsx"')
    res.send(buffer)
  }

  @Get('employees/import-template')
  async getImportTemplate(@Res() res: Response) {
    const buffer = await this.importService.getTemplateBuffer()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="employees-template.xlsx"')
    res.send(buffer)
  }

  @Get('employees/:id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.hrService.findOneEmployee(tenantId, id)
  }

  @Get('employees/:id/history')
  getHistory(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.hrService.getEmployeeHistory(tenantId, id)
  }

  @Post('employees')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.SYSTEM_ADMIN)
  create(@TenantId() tenantId: string, @Body() dto: CreateEmployeeDto, @CurrentUser() user: any) {
    return this.hrService.createEmployee(tenantId, dto, user.id)
  }

  @Post('employees/bulk')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  bulkCreate(@TenantId() tenantId: string, @Body() body: { employees: CreateEmployeeDto[] }, @CurrentUser() user: any) {
    return this.hrService.bulkCreate(tenantId, body.employees, user.id)
  }

  @Post('employees/import')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async importEmployees(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const { employees, errors } = await this.importService.parseExcel(file.buffer)
    const result = await this.hrService.bulkCreate(tenantId, employees as any, user.id)
    return { ...result, parseErrors: errors }
  }

  @Put('employees/:id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.SYSTEM_ADMIN)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.hrService.updateEmployee(tenantId, id, dto, user.id)
  }

  @Post('employees/:id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadAvatar(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.storageService.uploadFile(tenantId, file, 'avatars')
    return this.hrService.updateAvatar(tenantId, id, url)
  }

  @Delete('employees/:id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  remove(@TenantId() tenantId: string, @Param('id') id: string, @CurrentUser() user: any) {
    return this.hrService.deactivateEmployee(tenantId, id, user.id)
  }

  // ── Departments ────────────────────────────────────────────

  @Get('departments')
  getDepartments(@TenantId() tenantId: string) {
    return this.hrService.findAllDepartments(tenantId)
  }

  @Post('departments')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  createDepartment(@TenantId() tenantId: string, @Body() dto: CreateDepartmentDto) {
    return this.hrService.createDepartment(tenantId, dto)
  }

  @Put('departments/:id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  updateDepartment(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateDepartmentDto>) {
    return this.hrService.updateDepartment(tenantId, id, dto)
  }

  // ── Positions ──────────────────────────────────────────────

  @Get('positions')
  getPositions(@TenantId() tenantId: string, @Query('departmentId') departmentId?: string) {
    return this.hrService.findAllPositions(tenantId, departmentId)
  }

  @Post('positions')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  createPosition(@TenantId() tenantId: string, @Body() dto: CreatePositionDto) {
    return this.hrService.createPosition(tenantId, dto)
  }
}
