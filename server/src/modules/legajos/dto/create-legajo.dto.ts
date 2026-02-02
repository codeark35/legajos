import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLegajoDto {
  @ApiProperty({
    description: 'ID de la persona',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  personaId: string;

  @ApiProperty({
    description: 'ID de la facultad',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  facultadId: string;

  @ApiProperty({
    description: 'Número de legajo',
    example: 'LEG-2024-001',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  numeroLegajo: string;

  @ApiProperty({
    description: 'Fecha de apertura en formato ISO 8601',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaApertura?: string;
}
