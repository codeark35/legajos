import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoFacultad } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryFacultadDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre',
    example: 'Ciencias',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por código',
    example: 'FCE',
  })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo',
    enum: TipoFacultad,
  })
  @IsOptional()
  @IsEnum(TipoFacultad)
  tipo?: TipoFacultad;
}
