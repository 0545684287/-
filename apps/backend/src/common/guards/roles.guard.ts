import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole, ROLE_HIERARCHY } from '@safetywork/shared'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles?.length) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) return false

    const userLevel = ROLE_HIERARCHY[user.role as UserRole] || 0
    const hasAccess = requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role])

    if (!hasAccess) throw new ForbiddenException('Insufficient permissions')
    return true
  }
}
