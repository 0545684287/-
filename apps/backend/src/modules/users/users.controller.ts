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
import { UsersService, CreateUserDto, UpdateUserDto, UserQueryDto } from './users.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantId, CurrentUser } from '../../common/decorators/tenant.decorator'
import { UserRole } from '@safetywork/shared'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users in a tenant' })
  findAll(@TenantId() tenantId: string, @Query() query: UserQueryDto) {
    return this.usersService.findAll(tenantId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id)
  }

  @Post()
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  create(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId, dto)
  }

  @Put(':id')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, dto)
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a user' })
  deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.usersService.deactivate(tenantId, id)
  }

  @Patch(':id/change-password')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change a user password' })
  changePassword(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    return this.usersService.changePassword(tenantId, id, body.password)
  }
}
