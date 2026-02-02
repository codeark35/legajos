import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryLegajosDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Buscar por número de legajo, nombre o apellido de persona',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por ID de facultad',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  facultadId?: string;

  @ApiProperty({
    description: 'Filtrar por ID de persona',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  personaId?: string;
}
