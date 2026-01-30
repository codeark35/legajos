import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryDocumentoDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por nombre de documento',
    example: 'título',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de legajo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  legajoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de documento',
    enum: TipoDocumento,
  })
  @IsOptional()
  @IsEnum(TipoDocumento)
  tipoDocumento?: TipoDocumento;

  @ApiPropertyOptional({
    description: 'Búsqueda por tags',
    example: 'universidad,2020',
  })
  @IsOptional()
  @IsString()
  tags?: string;
}
