import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoLegajo, EstadoLegajo } from '@prisma/client';

export class CreateLegajoDto {
  @ApiProperty({
    description: 'ID de la persona',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  personaId: string; 

  @ApiPropertyOptional({ // ❌ CAMBIO: era @ApiProperty
    description: 'ID de la facultad',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional() // ❌ CAMBIO: era @IsNotEmpty
  facultadId?: string; 

  @ApiPropertyOptional({ // ❌ CAMBIO: era @ApiProperty
    description: 'Número de legajo',
    example: 'LEG-2024-001',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @IsOptional() // ❌ CAMBIO: era @IsNotEmpty
  @MinLength(5)
  @MaxLength(50)
  numeroLegajo?: string; 

  @ApiPropertyOptional({ 
    description: 'Fecha de apertura en formato ISO 8601',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsOptional()
  fechaApertura?: string; 

  @ApiPropertyOptional({ 
    description: 'Tipo de legajo',
    enum: TipoLegajo,
    default: TipoLegajo.DOCENTE,
    example: TipoLegajo.DOCENTE,
  })
  @IsEnum(TipoLegajo)
  @IsOptional()
  tipoLegajo?: TipoLegajo;

  @ApiPropertyOptional({ 
    description: 'Estado de legajo',
    enum: EstadoLegajo, // 
    default: EstadoLegajo.ACTIVO,
    example: EstadoLegajo.ACTIVO,
  })
  @IsEnum(EstadoLegajo) // 
  @IsOptional()
  estadoLegajo?: EstadoLegajo; 

  @ApiPropertyOptional({ 
    description: 'Observaciones adicionales sobre el legajo',
    example: 'Legajo creado para docente de tiempo completo',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}