import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateNombramientoDto } from './create-nombramiento.dto';

export class UpdateNombramientoDto extends PartialType(
  OmitType(CreateNombramientoDto, ['legajoId'] as const),
) {}
