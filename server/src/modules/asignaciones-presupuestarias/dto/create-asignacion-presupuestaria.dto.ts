import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsignacionPresupuestariaDto {
  @ApiProperty({
    description: 'ID del nombramiento',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  nombramientoId: string;

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
}
