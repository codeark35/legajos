import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario', example: 'admin@legajos.com' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@legajos.com' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: 'Nombre de usuario', example: 'juanperez' })
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(50)
  nombreUsuario: string;

  @ApiPropertyOptional({ description: 'Rol del usuario', example: 'USUARIO', enum: ['ADMIN', 'RRHH', 'USUARIO'] })
  @IsOptional()
  @IsEnum(['ADMIN', 'RRHH', 'USUARIO'], { message: 'Rol inválido' })
  rol?: string;
}
