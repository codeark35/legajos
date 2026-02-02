import { PartialType } from '@nestjs/swagger';
import { CreateLineaPresupuestariaDto } from './create-linea-presupuestaria.dto';

export class UpdateLineaPresupuestariaDto extends PartialType(
  CreateLineaPresupuestariaDto,
) {}
