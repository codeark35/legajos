import { PartialType } from '@nestjs/swagger';
import { CreateLegajoDto } from './create-legajo.dto';

export class UpdateLegajoDto extends PartialType(CreateLegajoDto) {}
