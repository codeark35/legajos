import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class FinalizarAsignacionDto {
  @ApiProperty({
    description: 'Fecha de finalización de la asignación',
    example: '2024-12-31',
  })
  @IsDateString()
  fechaFin: string;
}
