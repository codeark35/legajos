import { Module } from '@nestjs/common';
import { LineasPresupuestariasService } from './lineas-presupuestarias.service';
import { LineasPresupuestariasController } from './lineas-presupuestarias.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LineasPresupuestariasController],
  providers: [LineasPresupuestariasService],
  exports: [LineasPresupuestariasService],
})
export class LineasPresupuestariasModule {}
