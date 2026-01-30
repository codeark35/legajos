import { Module } from '@nestjs/common';
import { FacultadesService } from './facultades.service';
import { FacultadesController } from './facultades.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FacultadesController],
  providers: [FacultadesService],
  exports: [FacultadesService],
})
export class FacultadesModule {}
