import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateNombramientoAsignacionDto {
  @ApiProperty({
    description: 'ID del nombramiento',
    example: 'uuid-nombramiento',
  })
  @IsUUID()
  nombramientoId: string;

  @ApiProperty({
    description: 'ID de la asignación presupuestaria',
    example: 'uuid-asignacion',
  })
  @IsUUID()
  asignacionPresupuestariaId: string;

  @ApiProperty({
    description: 'Fecha de inicio de la asignación',
    example: '2024-01-01',
  })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin de la asignación (opcional)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: 'Observaciones',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
