import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoNombramiento } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryNombramientoDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de legajo',
  })
  @IsOptional()
  @IsUUID()
  legajoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoNombramiento,
  })
  @IsOptional()
  @IsEnum(EstadoNombramiento)
  estadoNombramiento?: EstadoNombramiento;

  @ApiPropertyOptional({
    description: 'Buscar por número de resolución',
  })
  @IsOptional()
  @IsString()
  resolucionNumero?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha desde',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha hasta',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Solo nombramientos vigentes',
    example: true,
  })
  @IsOptional()
  soloVigentes?: boolean;
}
