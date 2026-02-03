import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class UpdateHistoricoMensualDto {
  @ApiProperty({ description: 'Año', example: 2024 })
  @IsInt()
  @Min(1997)
  @Max(2100)
  anio: number;

  @ApiProperty({ description: 'Mes (1-12)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty({ description: 'ID de la línea presupuestaria' })
  @IsUUID()
  lineaPresupuestariaId: string;

  @ApiProperty({ description: 'ID de la categoría presupuestaria' })
  @IsUUID()
  categoriaPresupuestariaId: string;

  @ApiProperty({ description: 'Monto presupuestado', example: 3500000 })
  @IsNumber()
  @Min(0)
  presupuestado: number;

  @ApiPropertyOptional({ description: 'Monto devengado', example: 3021000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  devengado?: number;

  @ApiPropertyOptional({ description: 'Aportes patronales (IPS)', example: 600000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPatronales?: number;

  @ApiPropertyOptional({ description: 'Aportes personales (IPS)', example: 300000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPersonales?: number;

  @ApiPropertyOptional({ description: 'Descuentos varios', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentos?: number;

  @ApiPropertyOptional({ description: 'Neto recibido', example: 2721000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netoRecibido?: number;

  @ApiPropertyOptional({ description: 'Observaciones del mes' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
