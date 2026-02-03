import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateHistoricoMensualDto {
  @ApiProperty({
    description: 'Año',
    example: 2024,
  })
  @IsNumber()
  @Min(2000)
  anio: number;

  @ApiProperty({
    description: 'Mes (1-12)',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  mes: number;

  @ApiProperty({
    description: 'Monto presupuestado',
    example: 4000000,
  })
  @IsNumber()
  @Min(0)
  presupuestado: number;

  @ApiProperty({
    description: 'Monto devengado (lo que realmente cobró)',
    example: 3800000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  devengado?: number;

  @ApiProperty({
    description: 'Aportes patronales (IPS empleador)',
    example: 720000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPatronales?: number;

  @ApiProperty({
    description: 'Aportes personales (IPS empleado)',
    example: 360000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPersonales?: number;

  @ApiProperty({
    description: 'Descuentos (préstamos, multas, etc.)',
    example: 40000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentos?: number;

  @ApiProperty({
    description: 'Neto recibido',
    example: 2680000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netoRecibido?: number;

  @ApiProperty({
    description: 'Observaciones del mes',
    example: 'Faltó 2 días por enfermedad',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
