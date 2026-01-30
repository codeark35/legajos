import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Seguridad
  app.use(helmet());
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation pipe global con configuración optimizada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma los tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false, // Muestra todos los errores
    }),
  );

  // CORS configurado de forma segura
  app.enableCors({
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // Cache preflight for 24 hours
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Sistema de Legajos API')
    .setDescription(
      'API REST para gestión integral de legajos de funcionarios universitarios. ' +
      'Incluye gestión de personas, legajos, nombramientos, asignaciones salariales, ' +
      'documentos y autenticación con JWT.',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Endpoints de autenticación y autorización')
    .addTag('Personas', 'Gestión de personas (datos personales)')
    .addTag('Legajos', 'Gestión de legajos (expedientes)')
    .addTag('Nombramientos', 'Gestión de nombramientos y asignaciones salariales')
    .addTag('Facultades', 'Gestión de facultades y dependencias')
    .addTag('Cargos', 'Gestión de cargos y posiciones')
    .addTag('Documentos', 'Gestión de documentos y archivos adjuntos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Desarrollo')
    .addServer('https://api.legajos.com', 'Producción')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Legajos API - Documentación',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Aplicación iniciada en: http://localhost:${port}`);

  logger.log(`📚 Documentación disponible en: http://localhost:${port}/api/docs`);
  logger.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
