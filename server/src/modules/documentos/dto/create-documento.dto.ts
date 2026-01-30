import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento } from '@prisma/client';

export class CreateDocumentoDto {
  @ApiProperty({
    description: 'ID del legajo al que pertenece el documento',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  legajoId: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumento,
    example: 'TITULO_UNIVERSITARIO',
  })
  @IsEnum(TipoDocumento)
  @IsNotEmpty()
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    description: 'Nombre descriptivo del documento',
    example: 'Título de Licenciatura en Economía',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombreDocumento: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del documento',
    example: 'Título universitario obtenido en 2020',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Tags para búsqueda (separados por coma)',
    example: 'título,universidad,2020',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional({
    description: 'Número de referencia del documento',
    example: 'DOC-2024-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  numeroReferencia?: string;
}

export class UploadDocumentoDto extends CreateDocumentoDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo a subir (PDF, JPG, PNG)',
  })
  archivo: any;
}
