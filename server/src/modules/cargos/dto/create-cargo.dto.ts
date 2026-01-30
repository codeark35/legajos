import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCargoDto {
  @ApiProperty({
    description: 'Nombre del cargo',
    example: 'Director de Carrera',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cargo es requerido' })
  @MaxLength(200)
  nombreCargo: string;

  @ApiPropertyOptional({
    description: 'Descripción del cargo',
    example: 'Responsable de la gestión académica de la carrera',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Nivel jerárquico (1 = más alto)',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  nivelJerarquico?: number;

  @ApiPropertyOptional({
    description: 'Departamento o área del cargo',
    example: 'Académica',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  departamentoArea?: string;
}
