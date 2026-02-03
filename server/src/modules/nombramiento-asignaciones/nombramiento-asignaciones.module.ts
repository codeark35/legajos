import { Module } from '@nestjs/common';
import { NombramientoAsignacionesService } from './nombramiento-asignaciones.service';
import { NombramientoAsignacionesController } from './nombramiento-asignaciones.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NombramientoAsignacionesService],
  controllers: [NombramientoAsignacionesController],
  exports: [NombramientoAsignacionesService],
})
export class NombramientoAsignacionesModule {}
