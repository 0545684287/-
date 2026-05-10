import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'
import { UserEntity } from '../../database/entities/user.entity'
import { TenantEntity } from '../../database/entities/tenant.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const tenant = await this.tenantRepo.findOne({ where: { slug: dto.tenantSlug } })
    if (!tenant) throw new UnauthorizedException('Invalid credentials')

    const user = await this.userRepo.findOne({
      where: { email: dto.email, tenantId: tenant.id, isActive: true },
      select: ['id', 'email', 'passwordHash', 'role', 'twoFactorEnabled', 'twoFactorSecret', 'firstName', 'lastName', 'tenantId', 'language'],
    })

    if (!user || !await bcrypt.compare(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return { requiresTwoFactor: true }
      }
      const valid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: dto.twoFactorCode,
      })
      if (!valid) throw new UnauthorizedException('Invalid 2FA code')
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() })

    return this.generateTokens(user, tenant)
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      })
      const user = await this.userRepo.findOne({ where: { id: payload.sub } })
      if (!user || !user.refreshTokenHash) throw new UnauthorizedException()
      const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash)
      if (!valid) throw new UnauthorizedException()
      const tenant = await this.tenantRepo.findOne({ where: { id: user.tenantId } })
      return this.generateTokens(user, tenant)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async setup2FA(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    const secret = speakeasy.generateSecret({ name: `SafetyWork (${user.email})` })
    await this.userRepo.update(userId, { twoFactorSecret: secret.base32 })
    const qrCode = await QRCode.toDataURL(secret.otpauth_url)
    return { secret: secret.base32, qrCode }
  }

  async confirm2FA(userId: string, code: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'twoFactorSecret'],
    })
    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    })
    if (!valid) throw new BadRequestException('Invalid code')
    await this.userRepo.update(userId, { twoFactorEnabled: true })
    return { enabled: true }
  }

  private async generateTokens(user: UserEntity, tenant: TenantEntity) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: tenant.slug,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.refreshSecret'),
      expiresIn: this.config.get('jwt.refreshExpiresIn'),
    })

    await this.userRepo.update(user.id, {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        tenantId: user.tenantId,
      },
    }
  }
}
