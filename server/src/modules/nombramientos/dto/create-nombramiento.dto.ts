import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNombramientoDto {
  @ApiProperty({
    description: 'ID del legajo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  legajoId: string;

  @ApiProperty({
    description: 'ID del cargo',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  cargoId: string;

  @ApiProperty({
    description: 'Fecha de inicio en formato ISO 8601',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin en formato ISO 8601',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiProperty({
    description: 'Indica si el nombramiento está vigente',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  vigente?: boolean;

  @ApiProperty({
    description: 'Observaciones adicionales',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
