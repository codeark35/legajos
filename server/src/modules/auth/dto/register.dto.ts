import { IsEmail, IsString, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/decorators/roles.decorator';

export class RegisterDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@uni.edu.py' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ description: 'Nombre de usuario', example: 'jperez' })
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  nombreUsuario: string;

  @ApiProperty({ description: 'Contraseña', example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' })
  @Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: ['ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO'], default: 'USUARIO' })
  @IsEnum(['ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO'])
  rol: Role;
}
