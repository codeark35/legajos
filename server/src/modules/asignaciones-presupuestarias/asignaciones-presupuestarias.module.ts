import { Module } from '@nestjs/common';
import { AsignacionesPresupuestariasService } from './asignaciones-presupuestarias.service';
import { AsignacionesPresupuestariasController } from './asignaciones-presupuestarias.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AsignacionesPresupuestariasController],
  providers: [AsignacionesPresupuestariasService],
  exports: [AsignacionesPresupuestariasService],
})
export class AsignacionesPresupuestariasModule {}
