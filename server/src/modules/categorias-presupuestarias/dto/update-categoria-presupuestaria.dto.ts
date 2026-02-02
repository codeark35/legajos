import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaPresupuestariaDto } from './create-categoria-presupuestaria.dto';

export class UpdateCategoriaPresupuestariaDto extends PartialType(
  CreateCategoriaPresupuestariaDto,
) {}
