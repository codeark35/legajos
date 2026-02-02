import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HistoricoMensualDto {
  @ApiProperty({
    description: 'Monto presupuestado para el mes',
    example: 5000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  presupuestado: number;

  @ApiProperty({
    description: 'Monto devengado en el mes',
    example: 4500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  devengado: number;

  @ApiProperty({
    description: 'Aportes patronales del mes',
    example: 800000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPatronales?: number;

  @ApiProperty({
    description: 'Aportes personales del mes',
    example: 500000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aportesPersonales?: number;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Pago completo del mes',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
