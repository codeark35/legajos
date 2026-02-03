import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class AgregarMesDto {
  @ApiProperty({ description: 'Año', example: 2024, minimum: 1997, maximum: 2100 })
  @IsInt()
  @Min(1997)
  @Max(2100)
  anio: number;

  @ApiProperty({ description: 'Mes (1-12)', example: 1, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty({ description: 'Monto presupuestado', example: 4000000 })
  @IsNumber()
  @Min(0)
  presupuestado: number;

  @ApiProperty({ description: 'Monto devengado', example: 4000000 })
  @IsNumber()
  @Min(0)
  devengado: number;

  @ApiPropertyOptional({ description: 'Aporte jubilatorio (patronal)', example: 800000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aporteJubilatorio?: number;

  @ApiPropertyOptional({ description: 'Aportes personales (IPS)', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPersonales?: number;

  @ApiProperty({ description: 'ID de la línea presupuestaria' })
  @IsUUID()
  lineaPresupuestariaId: string;

  @ApiProperty({ description: 'ID de la categoría presupuestaria' })
  @IsUUID()
  categoriaPresupuestariaId: string;

  @ApiPropertyOptional({ description: 'Código de objeto de gasto', example: '111' })
  @IsOptional()
  @IsString()
  objetoGasto?: string;

  @ApiPropertyOptional({ description: 'Observaciones del mes' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
