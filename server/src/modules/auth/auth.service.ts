import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registro de nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { email, nombreUsuario, password, rol } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await this.prisma.usuario.create({
      data: {
        email,
        nombreUsuario,
        passwordHash: hashedPassword,
        rol,
        activo: true,
      },
      select: {
        id: true,
        email: true,
        nombreUsuario: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    // Generar token
    const token = this.generateToken(user.id, user.email, user.rol);

    return {
      user,
      token,
    };
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si está activo
    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user.id, user.email, user.rol);

    return {
      user: {
        id: user.id,
        email: user.email,
        nombreUsuario: user.nombreUsuario,
        rol: user.rol,
        activo: user.activo,
      },
      token,
    };
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombreUsuario: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Generar JWT token
   */
  private generateToken(userId: string, email: string, rol: string): string {
    const payload = {
      sub: userId,
      email,
      rol,
    };

    return this.jwtService.sign(payload);
  }
}
