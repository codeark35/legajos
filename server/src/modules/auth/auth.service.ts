import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nombreUsuario, rol } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.prisma.usuario.create({
      data: {
        email,
        passwordHash: hashedPassword,
        nombreUsuario,
        rol: (rol as RolUsuario) || RolUsuario.USUARIO,
        activo: true,
      },
    });

    this.logger.log(`Usuario registrado: ${email}`);

    // Generar token
    const token = await this.generateToken(user.id, user.email, user.rol);

    return {
      user: {
        id: user.id,
        email: user.email,
        nombreUsuario: user.nombreUsuario,
        rol: user.rol,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    this.logger.log(`Usuario autenticado: ${email}`);

    // Generar token
    const token = await this.generateToken(user.id, user.email, user.rol);

    return {
      user: {
        id: user.id,
        email: user.email,
        nombreUsuario: user.nombreUsuario,
        rol: user.rol,
      },
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(userId: string, email: string, rol: string) {
    const payload = { sub: userId, email, rol };
    return this.jwtService.sign(payload);
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombreUsuario: true,
        rol: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
