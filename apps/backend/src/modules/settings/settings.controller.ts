import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import {
  SettingsService,
  UpdateBrandingDto,
  UpdateNotificationSettingsDto,
} from './settings.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantId } from '../../common/decorators/tenant.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('branding')
  @ApiOperation({ summary: 'Get tenant branding settings' })
  getBranding(@TenantId() tenantId: string) {
    return this.settingsService.getBranding(tenantId)
  }

  @Put('branding')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update tenant branding settings' })
  updateBranding(@TenantId() tenantId: string, @Body() dto: UpdateBrandingDto) {
    return this.settingsService.updateBranding(tenantId, dto)
  }

  @Get('modules')
  @ApiOperation({ summary: 'Get enabled modules list' })
  getModules(@TenantId() tenantId: string) {
    return this.settingsService.getModules(tenantId)
  }

  @Put('modules')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update enabled modules list' })
  updateModules(@TenantId() tenantId: string, @Body() body: { modules: string[] }) {
    return this.settingsService.updateModules(tenantId, body.modules)
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notification settings' })
  getNotificationSettings(@TenantId() tenantId: string) {
    return this.settingsService.getNotificationSettings(tenantId)
  }

  @Put('notifications')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update notification settings' })
  updateNotificationSettings(
    @TenantId() tenantId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.settingsService.updateNotificationSettings(tenantId, dto)
  }

  @Get('locale')
  @ApiOperation({ summary: 'Get timezone and language settings' })
  getTimezone(@TenantId() tenantId: string) {
    return this.settingsService.getTimezone(tenantId)
  }

  @Patch('locale')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update timezone and language settings' })
  updateTimezone(
    @TenantId() tenantId: string,
    @Body() dto: { timezone?: string; language?: string },
  ) {
    return this.settingsService.updateTimezone(tenantId, dto)
  }
}
