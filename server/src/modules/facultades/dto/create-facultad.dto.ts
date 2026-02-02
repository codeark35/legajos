import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacultadDto {
  @ApiProperty({
    description: 'Nombre de la facultad',
    example: 'Facultad de Ciencias Exactas',
    minLength: 3,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  nombreFacultad: string;

  @ApiProperty({
    description: 'Código de la facultad',
    example: 'FCE',
    required: false,
  })
  @IsString()
  codigo?: string;
}
