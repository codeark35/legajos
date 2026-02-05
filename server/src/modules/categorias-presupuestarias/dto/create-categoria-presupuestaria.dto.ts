import { ApiProperty, ApiPropertyOptional  } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateCategoriaPresupuestariaDto {
  @ApiProperty({
    description: 'Código de la categoría presupuestaria',
    example: 'L33',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  codigoCategoria: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Docente Técnico',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @ApiProperty({
    description:'Clasificacion del personal',
    example:'ADMINISTRATIVO',
    enum:['DOCENTE', 'ADMINISTRATIVO', 'TECNICO']
  })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Escala salarial',
    example: 'ADMINISTRATIVA',
    enum: ['UNIVERSITARIA', 'ADMINISTRATIVA', 'TECNICO'],
  })
  @IsOptional()
  @IsString()
  escalaSalarial?: string;

  @ApiProperty({
    description: 'Rango salarial mínimo en guaraníes',
    example: 2500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  rangoSalarialMin: number;

  @ApiProperty({
    description: 'Rango salarial máximo en guaraníes',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  rangoSalarialMax: number;

  @ApiProperty({
    description: 'Indica si la categoría está vigente',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  vigente?: boolean;
}
