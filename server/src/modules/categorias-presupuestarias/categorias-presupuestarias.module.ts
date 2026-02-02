import { Module } from '@nestjs/common';
import { CategoriasPresupuestariasService } from './categorias-presupuestarias.service';
import { CategoriasPresupuestariasController } from './categorias-presupuestarias.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriasPresupuestariasController],
  providers: [CategoriasPresupuestariasService],
  exports: [CategoriasPresupuestariasService],
})
export class CategoriasPresupuestariasModule {}
