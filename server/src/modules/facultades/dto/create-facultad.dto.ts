import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoFacultad } from '@prisma/client';

export class CreateFacultadDto {
  @ApiProperty({
    description: 'Nombre de la facultad o dependencia',
    example: 'Facultad de Ciencias Económicas',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la facultad es requerido' })
  @MaxLength(200)
  nombreFacultad: string;

  @ApiPropertyOptional({
    description: 'Código único de la facultad',
    example: 'FCE',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiProperty({
    description: 'Tipo de dependencia',
    enum: TipoFacultad,
    example: TipoFacultad.FACULTAD,
  })
  @IsEnum(TipoFacultad)
  @IsNotEmpty({ message: 'El tipo de facultad es requerido' })
  tipo: TipoFacultad;

  @ApiPropertyOptional({
    description: 'Descripción adicional',
    example: 'Facultad encargada de formar profesionales en ciencias económicas',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;
}
