import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryNombramientosDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Filtrar por ID de legajo',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  legajoId?: string;

  @ApiProperty({
    description: 'Filtrar por ID de cargo',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  cargoId?: string;

  @ApiProperty({
    description: 'Filtrar por vigencia',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  vigente?: boolean;

  @ApiProperty({
    description: 'Buscar en observaciones',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
