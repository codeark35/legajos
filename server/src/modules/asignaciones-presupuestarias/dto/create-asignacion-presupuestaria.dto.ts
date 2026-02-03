import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsignacionPresupuestariaDto {
  @ApiProperty({
    description: 'Código único de la asignación presupuestaria',
    example: 'CAT-L33-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({
    description: 'Descripción de la asignación presupuestaria',
    example: 'Docente Técnico - Categoría L33 - Línea 100',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'ID de la categoría presupuestaria',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoriaPresupuestariaId?: string;

  @ApiProperty({
    description: 'ID de la línea presupuestaria',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  lineaPresupuestariaId?: string;

  @ApiProperty({
    description: 'Código de objeto de gasto',
    example: '100',
    required: false,
  })
  @IsOptional()
  @IsString()
  objetoGasto?: string;

  @ApiProperty({
    description: 'Salario base',
    example: 5000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  salarioBase: number;

  @ApiProperty({
    description: 'Moneda',
    example: 'PYG',
    default: 'PYG',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(PYG|USD|EUR)$/)
  moneda?: string;

  @ApiProperty({
    description: 'Si la asignación está vigente',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  vigente?: boolean;
}
