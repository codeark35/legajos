import { SetMetadata } from '@nestjs/common';

export type Role = 'ADMIN' | 'RECURSOS_HUMANOS' | 'CONSULTA' | 'USUARIO';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles requeridos en un endpoint
 * Uso: @Roles('ADMIN', 'RECURSOS_HUMANOS')
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
