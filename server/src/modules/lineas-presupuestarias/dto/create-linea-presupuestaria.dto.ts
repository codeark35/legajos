import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateLineaPresupuestariaDto {
  @ApiProperty({
    description: 'Código de la línea presupuestaria',
    example: '100-001',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  codigoLinea: string;

  @ApiProperty({
    description: 'Descripción de la línea presupuestaria',
    example: 'Personal docente permanente',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @ApiProperty({
    description: 'Indica si la línea está vigente',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  vigente?: boolean;
}
