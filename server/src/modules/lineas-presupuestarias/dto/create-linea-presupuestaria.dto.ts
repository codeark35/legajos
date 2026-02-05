import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLineaPresupuestariaDto {
  @ApiProperty({
    description: 'Código único de la línea presupuestaria',
    example: '100',
  })
  @IsString()
  @IsNotEmpty()
  codigoLinea: string; // ✅ REQUERIDO (no tiene ? ni @default)

  @ApiPropertyOptional({
    description: 'Descripción de la línea presupuestaria',
    example: 'Remuneraciones del personal docente',
  })
  @IsOptional()
  @IsString()
  descripcion?: string; 

  @ApiPropertyOptional({
    description: 'Tipo de línea presupuestaria',
    example: 'DOCENTE',
    enum: ['DOCENTE', 'ADMINISTRATIVO', 'TECNICO'],
  })
  @IsOptional()
  @IsString()
  tipo?: string; 


  @ApiPropertyOptional({
    description: 'Indica si la línea presupuestaria está vigente',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  vigente?: boolean; // ✅ OPCIONAL (@default(true))
}