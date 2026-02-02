import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

const roleHierarchy: Record<Role, number> = {
  ADMIN: 4,
  RECURSOS_HUMANOS: 3,
  CONSULTA: 2,
  USUARIO: 1,
};

/**
 * Guard para verificar que el usuario tiene el rol requerido o superior
 * Uso: @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.rol) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const userLevel = roleHierarchy[user.rol as Role] || 0;
    const requiredLevel = Math.min(...requiredRoles.map(r => roleHierarchy[r]));

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(
        `No tienes permisos para realizar esta acción. Se requiere rol: ${requiredRoles.join(' o ')}`,
      );
    }

    return true;
  }
}
