import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check del servidor y base de datos' })
  @ApiResponse({ status: 200, description: 'Servidor y BD funcionando correctamente' })
  @ApiResponse({ status: 503, description: 'Servicio no disponible' })
  async check() {
    const startTime = Date.now();
    
    try {
      // Verificar conexión a la base de datos
      await this.prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Sistema de Legajos API',
        version: '2.0.0',
        database: 'connected',
        responseTime: `${responseTime}ms`,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'Sistema de Legajos API',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
