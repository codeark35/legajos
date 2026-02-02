import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCargoDto {
  @ApiProperty({
    description: 'Nombre del cargo',
    example: 'Decano',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombreCargo: string;

  @ApiProperty({
    description: 'Descripción del cargo',
    example: 'Máxima autoridad de la facultad',
    required: false,
  })
  @IsString()
  descripcion?: string;
}
