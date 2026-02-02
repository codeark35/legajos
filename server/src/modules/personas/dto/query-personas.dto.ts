import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryPersonasDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre o apellido', example: 'Juan' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
  })
  @IsOptional()
  @IsEnum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}
