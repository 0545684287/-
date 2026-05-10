import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TenantsService, CreateTenantDto, UpdateTenantDto, TenantQueryDto } from './tenants.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
@Controller('v1/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  findAll(@Query() query: TenantQueryDto) {
    return this.tenantsService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id)
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get tenant usage statistics' })
  getStats(@Param('id') id: string) {
    return this.tenantsService.getStats(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto)
  }

  @Patch(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle tenant active status' })
  toggleActive(@Param('id') id: string) {
    return this.tenantsService.toggleActive(id)
  }
}
