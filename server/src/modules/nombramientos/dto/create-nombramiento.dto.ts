import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoNombramiento } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateNombramientoDto {
  @ApiProperty({
    description: 'ID del legajo asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del legajo es requerido' })
  legajoId: string;

  @ApiPropertyOptional({
    description: 'ID del cargo (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  cargoId?: string;

  @ApiProperty({
    description: 'Tipo de nombramiento',
    example: 'Docente Técnico',
  })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de nombramiento es requerido' })
  @MaxLength(200)
  tipoNombramiento: string;

  @ApiPropertyOptional({
    description: 'Categoría del nombramiento',
    example: 'Categoría A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @ApiProperty({
    description: 'Fecha de inicio del nombramiento',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del nombramiento',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Número de resolución',
    example: 'RES-2024-0123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  resolucionNumero?: string;

  @ApiPropertyOptional({
    description: 'Fecha de la resolución',
    example: '2024-01-10',
  })
  @IsOptional()
  @IsDateString()
  resolucionFecha?: string;

  @ApiPropertyOptional({
    description: 'ID de la resolución (si existe en el sistema)',
  })
  @IsOptional()
  @IsUUID()
  resolucionId?: string;

  @ApiPropertyOptional({
    description: 'Salario mensual',
    example: 5000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  salarioMensual?: number;

  @ApiPropertyOptional({
    description: 'Moneda del salario',
    example: 'PYG',
    default: 'PYG',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string;

  @ApiPropertyOptional({
    description: 'Estado del nombramiento',
    enum: EstadoNombramiento,
    example: EstadoNombramiento.VIGENTE,
  })
  @IsOptional()
  @IsEnum(EstadoNombramiento)
  estadoNombramiento?: EstadoNombramiento;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Nombramiento por renovación de contrato',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
}

export class CreateAsignacionSalarialDto {
  @ApiProperty({
    description: 'Código de categoría presupuestaria',
    example: 'L33',
  })
  @IsString()
  @IsNotEmpty({ message: 'La categoría presupuestaria es requerida' })
  @MaxLength(50)
  categoriaPresupuestaria: string;

  @ApiProperty({
    description: 'Monto de la asignación',
    example: 2500000,
  })
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser positivo' })
  @Min(0)
  @Type(() => Number)
  monto: number;

  @ApiPropertyOptional({
    description: 'Moneda',
    example: 'PYG',
    default: 'PYG',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string;

  @ApiProperty({
    description: 'Fecha desde la cual es válida la asignación',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha desde es requerida' })
  fechaDesde: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta la cual es válida la asignación',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la asignación',
    example: 'Bonificación por antigüedad',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
