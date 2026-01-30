import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombreUsuario: true,
        rol: true,
        activo: true,
      },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    return {
      id: user.id,
      email: user.email,
      nombreUsuario: user.nombreUsuario,
      roles: [user.rol],
    };
  }
}
