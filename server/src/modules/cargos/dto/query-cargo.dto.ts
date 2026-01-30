import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryCargoDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre del cargo',
    example: 'Director',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel jerárquico',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  nivelJerarquico?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por departamento o área',
    example: 'Académica',
  })
  @IsOptional()
  @IsString()
  departamentoArea?: string;
}
