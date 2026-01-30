import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPersona } from '@prisma/client';

export class CreatePersonaDto {
  @ApiProperty({
    description: 'Número de cédula de identidad',
    example: '1234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de cédula es requerido' })
  @MinLength(1)
  @MaxLength(20)
  numeroCedula: string;

  @ApiProperty({
    description: 'Nombres de la persona',
    example: 'Juan Carlos',
  })
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres' })
  @MaxLength(100)
  nombres: string;

  @ApiProperty({
    description: 'Apellidos de la persona',
    example: 'González López',
  })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100)
  apellidos: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Dirección de domicilio',
    example: 'Av. Principal 123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '0981123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico',
    example: 'juan.gonzalez@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({
    description: 'Estado de la persona',
    enum: EstadoPersona,
    example: EstadoPersona.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoPersona)
  estado?: EstadoPersona;
}
