import { PartialType } from '@nestjs/swagger';
import { CreateNombramientoDto } from './create-nombramiento.dto';

export class UpdateNombramientoDto extends PartialType(CreateNombramientoDto) {}
