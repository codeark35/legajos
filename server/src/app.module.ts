import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PersonasModule } from './modules/personas/personas.module';
import { LegajosModule } from './modules/legajos/legajos.module';
import { NombramientosModule } from './modules/nombramientos/nombramientos.module';
import { FacultadesModule } from './modules/facultades/facultades.module';
import { CargosModule } from './modules/cargos/cargos.module';
import { DocumentosModule } from './modules/documentos/documentos.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    PrismaModule,
    AuthModule,
    PersonasModule,
    LegajosModule,
    NombramientosModule,
    FacultadesModule,
    CargosModule,
    DocumentosModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
