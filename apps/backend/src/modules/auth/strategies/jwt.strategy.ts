import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../../../database/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('jwt.secret'),
    })
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub, isActive: true },
    })
    if (!user) throw new UnauthorizedException()
    return { ...user, tenantSlug: payload.tenantSlug }
  }
}
