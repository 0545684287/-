import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { SitesService, CreateSiteDto } from './sites.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantId, CurrentUser } from '../../common/decorators/tenant.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get('tree')
  getTree(@TenantId() tenantId: string) {
    return this.sitesService.getTree(tenantId)
  }

  @Get('flat')
  getFlat(@TenantId() tenantId: string) {
    return this.sitesService.getFlat(tenantId)
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.sitesService.getStats(tenantId)
  }

  @Get('my-sites')
  getMySites(@TenantId() tenantId: string, @CurrentUser() user: any) {
    return this.sitesService.getUserSites(tenantId, user.id, user.role)
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.sitesService.findOne(tenantId, id)
  }

  @Get(':id/users')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  getSiteUsers(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.sitesService.getSiteUsers(tenantId, id)
  }

  @Post()
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  create(@TenantId() tenantId: string, @Body() dto: CreateSiteDto) {
    return this.sitesService.create(tenantId, dto)
  }

  @Put(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateSiteDto>) {
    return this.sitesService.update(tenantId, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.sitesService.deactivate(tenantId, id)
  }

  @Post(':id/users')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  assignUser(
    @TenantId() tenantId: string,
    @Param('id') siteId: string,
    @Body() body: { userId: string; role: UserRole },
  ) {
    return this.sitesService.assignUserToSite(tenantId, body.userId, siteId, body.role)
  }

  @Delete(':id/users/:userId')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  removeUser(
    @TenantId() tenantId: string,
    @Param('id') siteId: string,
    @Param('userId') userId: string,
  ) {
    return this.sitesService.removeUserFromSite(tenantId, userId, siteId)
  }
}
