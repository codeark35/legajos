import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoLegajo, EstadoLegajo } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryLegajoDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por número de legajo',
    example: 'LEG-2026-0001',
  })
  @IsOptional()
  @IsString()
  numeroLegajo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de persona',
  })
  @IsOptional()
  @IsUUID()
  personaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de legajo',
    enum: TipoLegajo,
  })
  @IsOptional()
  @IsEnum(TipoLegajo)
  tipoLegajo?: TipoLegajo;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoLegajo,
  })
  @IsOptional()
  @IsEnum(EstadoLegajo)
  estadoLegajo?: EstadoLegajo;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de facultad',
  })
  @IsOptional()
  @IsUUID()
  facultadId?: string;
}
