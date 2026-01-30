import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoLegajo, EstadoLegajo } from '@prisma/client';

export class CreateLegajoDto {
  @ApiProperty({
    description: 'ID de la persona asociada al legajo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El ID de la persona es requerido' })
  personaId: string;

  @ApiProperty({
    description: 'Tipo de legajo',
    enum: TipoLegajo,
    example: TipoLegajo.DOCENTE,
  })
  @IsEnum(TipoLegajo)
  @IsNotEmpty({ message: 'El tipo de legajo es requerido' })
  tipoLegajo: TipoLegajo;

  @ApiPropertyOptional({
    description: 'ID de la facultad o dependencia',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  facultadId?: string;

  @ApiPropertyOptional({
    description: 'Fecha de apertura del legajo',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  fechaApertura?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Legajo creado para nuevo docente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Estado del legajo',
    enum: EstadoLegajo,
    example: EstadoLegajo.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoLegajo)
  estadoLegajo?: EstadoLegajo;
}
