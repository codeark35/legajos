import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLegajoDto } from './create-legajo.dto';

export class UpdateLegajoDto extends PartialType(
  OmitType(CreateLegajoDto, ['personaId'] as const),
) {}
