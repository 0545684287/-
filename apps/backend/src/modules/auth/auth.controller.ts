import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { Public } from '../../common/decorators/public.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/tenant.decorator'

@ApiTags('auth')
@Controller('v1/auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Public()
  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.authService.refresh(token)
  }

  @ApiBearerAuth()
  @Get('2fa/setup')
  setup2FA(@CurrentUser() user: any) {
    return this.authService.setup2FA(user.id)
  }

  @ApiBearerAuth()
  @Post('2fa/confirm')
  confirm2FA(@CurrentUser() user: any, @Body('code') code: string) {
    return this.authService.confirm2FA(user.id, code)
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: any) {
    return user
  }
}
