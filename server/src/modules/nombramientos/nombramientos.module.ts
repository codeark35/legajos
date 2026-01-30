import { Module } from '@nestjs/common';
import { NombramientosService } from './nombramientos.service';
import { NombramientosController } from './nombramientos.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NombramientosController],
  providers: [NombramientosService],
  exports: [NombramientosService],
})
export class NombramientosModule {}
