import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPersona } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryPersonaDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombres o apellidos',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de cédula',
    example: '1234567',
  })
  @IsOptional()
  @IsString()
  numeroCedula?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoPersona,
  })
  @IsOptional()
  @IsEnum(EstadoPersona)
  estado?: EstadoPersona;
}
