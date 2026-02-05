import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crear app con Fastify adapter (mejor rendimiento que Express)
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      trustProxy: true,
      bodyLimit: 10485760, // 10MB
      connectionTimeout: 30000,
      keepAliveTimeout: 65000,
    }),
  );

  // =============================================
  // CONFIGURACIÓN GLOBAL
  // =============================================

  // Global prefix para todas las rutas
  app.setGlobalPrefix('api/v1');

  // Validation pipe global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Rechazar requests con propiedades extra
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false, // Muestra todos los errores
    }),
  );

  // =============================================
  // SEGURIDAD
  // =============================================

  // Helmet para headers de seguridad (CSP deshabilitado para Swagger)
  await app.register(helmet as any, {
    contentSecurityPolicy: false, // Deshabilitado para que Swagger funcione correctamente
    crossOriginEmbedderPolicy: false,
  });

  // Compresión con Brotli/Gzip
  await app.register(compression as any, {
    encodings: ['br', 'gzip', 'deflate'],
    threshold: 1024, // Comprimir solo > 1KB
  });

  // CORS configurado de forma segura
  app.enableCors({
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // =============================================
  // SWAGGER DOCUMENTATION
  // =============================================

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Sistema de Legajos API')
    .setDescription(
      'API REST para gestión de legajos universitarios con sistema presupuestario mensual (JSONB optimizado) - NestJS + Fastify',
    )
    .setVersion('2.0.0')
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Personas', 'Gestión de personas')
    .addTag('Legajos', 'Gestión de legajos')
    .addTag('Nombramientos', 'Gestión de nombramientos')
    .addTag('Asignaciones', 'Gestión presupuestaria')
    .addTag('Histórico Mensual', 'Gestión de histórico mensual (JSONB)')
    .addTag('Facultades', 'Catálogo de facultades')
    .addTag('Cargos', 'Catálogo de cargos')
    .addTag('Documentos', 'Gestión de documentos y archivos')
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'list',
    },
    customSiteTitle: 'Legajos API - Documentación',
  });

  // =============================================
  // INICIAR SERVIDOR
  // =============================================

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🏛️  SISTEMA DE LEGAJOS - UNIVERSIDAD NACIONAL DE ITAPÚA    ║
║   🚀  NestJS + Fastify (Alto Rendimiento)                     ║
║                                                                ║
║   📍 Server: http://${host}:${port}                            ║
║   📚 API Docs: http://${host}:${port}/docs                     ║
║   🏥 Health: http://${host}:${port}/api/v1/health             ║
║                                                                ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'}    ║
║   ⚡ Adapter: Fastify (3x faster than Express)                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
