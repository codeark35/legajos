import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionPresupuestariaDto } from './create-asignacion-presupuestaria.dto';

export class UpdateAsignacionPresupuestariaDto extends PartialType(
  CreateAsignacionPresupuestariaDto,
) {}
