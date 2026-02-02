import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({ description: 'Número de cédula', example: '1234567' })
  @IsString()
  @MinLength(6, { message: 'El número de cédula debe tener al menos 6 caracteres' })
  numeroCedula: string;

  @ApiProperty({ description: 'Nombres', example: 'Juan Carlos' })
  @IsString()
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres' })
  nombres: string;

  @ApiProperty({ description: 'Apellidos', example: 'Pérez González' })
  @IsString()
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  apellidos: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento', example: '1990-01-15' })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de nacimiento inválida' })
  fechaNacimiento?: string;

  @ApiPropertyOptional({ description: 'Dirección', example: 'Av. Principal 123' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '0981-123456' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'juan.perez@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Estado de la persona',
    enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
    default: 'ACTIVO',
  })
  @IsOptional()
  @IsEnum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}
