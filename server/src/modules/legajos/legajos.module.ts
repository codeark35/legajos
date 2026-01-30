import { Module } from '@nestjs/common';
import { LegajosService } from './legajos.service';
import { LegajosController } from './legajos.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LegajosController],
  providers: [LegajosService],
  exports: [LegajosService],
})
export class LegajosModule {}
