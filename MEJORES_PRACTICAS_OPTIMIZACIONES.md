# 🚀 MEJORES PRÁCTICAS Y OPTIMIZACIONES AVANZADAS
## Sistema de Legajos UNI - Código Escalable y Optimizado

**Universidad Nacional de Itapúa**  
**Fecha**: 2 de febrero de 2026

---

## 📋 ÍNDICE

1. [Arquitectura Escalable](#arquitectura-escalable)
2. [Optimizaciones Backend Fastify](#optimizaciones-backend-fastify)
3. [Optimizaciones PostgreSQL](#optimizaciones-postgresql)
4. [Caching Estratégico](#caching-estratégico)
5. [Seguridad Avanzada](#seguridad-avanzada)
6. [Optimizaciones Frontend](#optimizaciones-frontend)
7. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)
8. [CI/CD y DevOps Avanzado](#cicd-y-devops-avanzado)

---

## 🏗️ ARQUITECTURA ESCALABLE

### 1.1 Patrón Repository para Separación de Responsabilidades

#### src/repositories/base.repository.ts
```typescript
import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/database.js';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  abstract getModelName(): string;

  async findById(id: string): Promise<T | null> {
    return this.prisma[this.getModelName()].findUnique({
      where: { id },
    });
  }

  async findMany(params: any): Promise<T[]> {
    return this.prisma[this.getModelName()].findMany(params);
  }

  async create(data: any): Promise<T> {
    return this.prisma[this.getModelName()].create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.prisma[this.getModelName()].update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.prisma[this.getModelName()].delete({
      where: { id },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma[this.getModelName()].count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma[this.getModelName()].count({
      where: { id },
    });
    return count > 0;
  }

  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }
}
```

#### src/repositories/persona.repository.ts
```typescript
import { Persona } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class PersonaRepository extends BaseRepository<Persona> {
  getModelName(): string {
    return 'persona';
  }

  async findByCI(numeroCedula: string): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { numeroCedula },
    });
  }

  async searchByName(search: string): Promise<Persona[]> {
    return this.prisma.persona.findMany({
      where: {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 50, // Límite de resultados
    });
  }

  async findWithLegajos(id: string) {
    return this.prisma.persona.findUnique({
      where: { id },
      include: {
        legajos: {
          include: {
            facultad: true,
            nombramientos: {
              where: { vigente: true },
              include: {
                cargo: true,
                asignacionPresupuestaria: {
                  include: {
                    categoriaPresupuestaria: true,
                    lineaPresupuestaria: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async bulkCreate(personas: any[]): Promise<number> {
    const result = await this.prisma.persona.createMany({
      data: personas,
      skipDuplicates: true,
    });
    return result.count;
  }
}
```

### 1.2 Service Layer con Inyección de Dependencias

#### src/services/base.service.ts
```typescript
import { BaseRepository } from '../repositories/base.repository.js';

export abstract class BaseService<T, R extends BaseRepository<T>> {
  protected repository: R;

  constructor(repository: R) {
    this.repository = repository;
  }

  async findById(id: string): Promise<T | null> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error(`${this.getEntityName()} no encontrado`);
    }
    return entity;
  }

  abstract getEntityName(): string;
}
```

#### src/services/persona.service.ts (Mejorado)
```typescript
import { PersonaRepository } from '../repositories/persona.repository.js';
import { BaseService } from './base.service.js';
import { Persona } from '@prisma/client';
import { CreatePersonaInput, UpdatePersonaInput } from '../schemas/persona.schema.js';
import { CacheService } from './cache.service.js';
import { AuditService } from './audit.service.js';

export class PersonaService extends BaseService<Persona, PersonaRepository> {
  private cacheService: CacheService;
  private auditService: AuditService;

  constructor(
    repository: PersonaRepository,
    cacheService: CacheService,
    auditService: AuditService
  ) {
    super(repository);
    this.cacheService = cacheService;
    this.auditService = auditService;
  }

  getEntityName(): string {
    return 'Persona';
  }

  async create(data: CreatePersonaInput, userId: string): Promise<Persona> {
    // Verificar duplicados
    const existing = await this.repository.findByCI(data.numeroCedula);
    if (existing) {
      throw new Error('La cédula ya está registrada');
    }

    // Crear persona en transacción
    const persona = await this.repository.create(data);

    // Invalidar caché
    await this.cacheService.invalidate('personas');

    // Auditar
    await this.auditService.log({
      tabla: 'personas',
      accion: 'CREATE',
      registroId: persona.id,
      userId,
      datosNuevos: persona,
    });

    return persona;
  }

  async findAll(params: any) {
    const cacheKey = `personas:list:${JSON.stringify(params)}`;
    
    // Intentar obtener de caché
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Consultar BD
    const result = await this.repository.findMany(params);

    // Guardar en caché (5 minutos)
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  async update(id: string, data: UpdatePersonaInput, userId: string): Promise<Persona> {
    const existing = await this.findById(id);

    const updated = await this.repository.update(id, data);

    // Invalidar caché
    await this.cacheService.invalidate(`persona:${id}`);
    await this.cacheService.invalidate('personas');

    // Auditar
    await this.auditService.log({
      tabla: 'personas',
      accion: 'UPDATE',
      registroId: id,
      userId,
      datosAnteriores: existing,
      datosNuevos: updated,
    });

    return updated;
  }
}
```

### 1.3 Dependency Injection Container

#### src/container/index.ts
```typescript
import { PersonaRepository } from '../repositories/persona.repository.js';
import { LegajoRepository } from '../repositories/legajo.repository.js';
import { NombramientoRepository } from '../repositories/nombramiento.repository.js';

import { PersonaService } from '../services/persona.service.js';
import { LegajoService } from '../services/legajo.service.js';
import { CacheService } from '../services/cache.service.js';
import { AuditService } from '../services/audit.service.js';

class Container {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory();
  }
}

export const container = new Container();

// Registrar servicios singleton
const cacheService = new CacheService();
const auditService = new AuditService();

// Registrar repositorios
container.register('PersonaRepository', () => new PersonaRepository());
container.register('LegajoRepository', () => new LegajoRepository());

// Registrar servicios
container.register('PersonaService', () => {
  const repo = container.resolve<PersonaRepository>('PersonaRepository');
  return new PersonaService(repo, cacheService, auditService);
});

container.register('CacheService', () => cacheService);
container.register('AuditService', () => auditService);
```

---

## ⚡ OPTIMIZACIONES BACKEND FASTIFY

### 2.1 Connection Pooling Optimizado

#### src/config/database.ts (Optimizado)
```typescript
import { PrismaClient } from '@prisma/client';

const databaseConfig = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  
  // Configuración de pool de conexiones
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// Configuración avanzada de Prisma
export const prisma = new PrismaClient({
  ...databaseConfig,
  
  // Configuración de conexiones
  __internal: {
    engine: {
      endpoint: process.env.DATABASE_URL,
      
      // Pool de conexiones optimizado
      connectionTimeout: 10000,  // 10 segundos
      poolTimeout: 10000,        // 10 segundos
      
      // Tamaño del pool según entorno
      connectionLimit: process.env.NODE_ENV === 'production' ? 10 : 5,
    },
  },
}).$extends({
  // Middleware para logging de queries lentas
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now();
      const result = await query(args);
      const end = Date.now();
      const duration = end - start;

      // Log queries lentas (> 500ms)
      if (duration > 500) {
        console.warn(`Slow query detected: ${model}.${operation} took ${duration}ms`);
      }

      return result;
    },
  },
});

// Middleware para retry en caso de errores transitorios
export const prismaWithRetry = prisma.$extends({
  query: {
    async $allOperations({ args, query }) {
      const maxRetries = 3;
      let lastError: any;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await query(args);
        } catch (error: any) {
          lastError = error;
          
          // Solo reintentar en errores de conexión
          if (error.code === 'P1001' || error.code === 'P1002') {
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
            continue;
          }
          
          throw error;
        }
      }

      throw lastError;
    },
  },
});

// Health check de BD
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 2.2 Rate Limiting Avanzado

#### src/plugins/rate-limit.plugin.ts
```typescript
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { RedisClientType } from 'redis';

export default fp(async (app: FastifyInstance) => {
  // Rate limiter con Redis (producción) o memoria (desarrollo)
  const useRedis = process.env.REDIS_URL && process.env.NODE_ENV === 'production';

  if (useRedis) {
    const { createClient } = await import('redis');
    const redis: RedisClientType = createClient({
      url: process.env.REDIS_URL,
    });

    await redis.connect();

    await app.register(rateLimit, {
      max: 100,              // 100 requests
      timeWindow: '15 minutes',
      cache: 10000,          // Cache de keys
      
      // Implementación con Redis
      redis,
      
      // Rate limit por IP
      keyGenerator: (request) => {
        return request.ip;
      },

      // Rate limit más estricto para rutas específicas
      nameSpace: 'global:',
      
      // Mensaje personalizado
      errorResponseBuilder: (request, context) => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Has excedido el límite de ${context.max} requests en ${context.after}`,
        retryAfter: context.ttl,
      }),
    });

    // Rate limit específico para login (más estricto)
    app.register(rateLimit, {
      max: 5,
      timeWindow: '5 minutes',
      redis,
      nameSpace: 'auth:',
    }, { prefix: '/api/v1/auth/login' });

  } else {
    // Configuración en memoria para desarrollo
    await app.register(rateLimit, {
      max: 1000,
      timeWindow: '15 minutes',
      keyGenerator: (request) => request.ip,
    });
  }
});
```

### 2.3 Logging Estructurado con Pino

#### src/config/logger.ts
```typescript
import pino from 'pino';
import { env } from './env.js';

const targets: pino.TransportTargetOptions[] = [];

// Pretty print en desarrollo
if (env.NODE_ENV === 'development') {
  targets.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  });
}

// Log a archivo en producción
if (env.NODE_ENV === 'production') {
  targets.push(
    {
      target: 'pino/file',
      options: { destination: './logs/app.log' },
    },
    {
      target: 'pino/file',
      level: 'error',
      options: { destination: './logs/error.log' },
    }
  );
}

export const logger = pino({
  level: env.LOG_LEVEL,
  
  // Información de contexto
  base: {
    env: env.NODE_ENV,
  },

  // Timestamps
  timestamp: pino.stdTimeFunctions.isoTime,

  // Serializers personalizados
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
      remoteAddress: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },

  transport: {
    targets,
  },
});

// Logger específico para queries
export const dbLogger = logger.child({ module: 'database' });

// Logger específico para autenticación
export const authLogger = logger.child({ module: 'auth' });
```

### 2.4 Middleware de Compresión Optimizado

#### src/plugins/compress.plugin.ts
```typescript
import fp from 'fastify-plugin';
import compress from '@fastify/compress';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  await app.register(compress, {
    global: true,
    
    // Usar Brotli en producción (mejor compresión)
    encodings: ['br', 'gzip', 'deflate'],
    
    // Threshold de 1KB (no comprimir archivos pequeños)
    threshold: 1024,
    
    // Nivel de compresión
    brotliOptions: {
      params: {
        [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT,
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4, // Balance entre velocidad y compresión
      },
    },
    
    zlibOptions: {
      level: 6, // Balance para gzip
    },

    // Personalizar por tipo de contenido
    customTypes: /^text\/|^application\/json|^application\/javascript/,
    
    // No comprimir imágenes/videos
    removeContentLengthHeader: true,
  });
});
```

---

## 🗄️ OPTIMIZACIONES POSTGRESQL

### 3.1 Índices Avanzados

#### prisma/migrations/[timestamp]_indices_optimizados/migration.sql
```sql
-- =====================================================================
-- ÍNDICES COMPUESTOS OPTIMIZADOS
-- =====================================================================

-- Búsquedas por nombre completo
CREATE INDEX idx_personas_nombre_completo 
ON personas USING gin(to_tsvector('spanish', apellidos || ' ' || nombres));

-- Búsquedas de legajos activos por facultad
CREATE INDEX idx_legajos_facultad_estado 
ON legajos(facultad_id, estado_legajo) 
WHERE estado_legajo = 'ACTIVO';

-- Nombramientos vigentes con fechas
CREATE INDEX idx_nombramientos_vigentes 
ON nombramientos(legajo_id, vigente, fecha_inicio DESC) 
WHERE vigente = true;

-- =====================================================================
-- ÍNDICE GIN PARA JSONB (Histórico Mensual)
-- =====================================================================

-- Búsqueda rápida en histórico mensual
CREATE INDEX idx_asig_historico_gin 
ON asignaciones_presupuestarias 
USING gin(historico_mensual jsonb_path_ops);

-- Búsqueda por año específico
CREATE INDEX idx_asig_historico_anio 
ON asignaciones_presupuestarias 
USING gin((historico_mensual -> '2026'));

-- =====================================================================
-- ÍNDICES PARCIALES (Solo datos relevantes)
-- =====================================================================

-- Solo documentos sin procesar OCR
CREATE INDEX idx_documentos_pendientes_ocr 
ON documentos(legajo_id, created_at) 
WHERE procesado_ocr = false;

-- Solo usuarios activos
CREATE INDEX idx_usuarios_activos 
ON usuarios(email, rol) 
WHERE activo = true;

-- =====================================================================
-- ÍNDICES PARA AUDITORÍA
-- =====================================================================

-- Búsqueda rápida de cambios recientes
CREATE INDEX idx_historial_reciente 
ON historial_cambios(tabla_afectada, fecha_modificacion DESC);

-- Cambios por usuario
CREATE INDEX idx_historial_usuario 
ON historial_cambios(usuario_modificacion, fecha_modificacion DESC);

-- =====================================================================
-- ESTADÍSTICAS EXTENDIDAS
-- =====================================================================

-- Mejorar estimaciones del query planner
CREATE STATISTICS stats_personas_busqueda 
ON apellidos, nombres 
FROM personas;

CREATE STATISTICS stats_legajos_filtros 
ON facultad_id, estado_legajo, tipo_legajo 
FROM legajos;
```

### 3.2 Funciones SQL Optimizadas

#### prisma/sql/funciones_optimizadas.sql
```sql
-- =====================================================================
-- FUNCIÓN: Agregar Mes con Validaciones
-- =====================================================================

CREATE OR REPLACE FUNCTION agregar_mes_optimizado(
    p_nombramiento_id UUID,
    p_anio TEXT,
    p_mes TEXT,
    p_data JSONB,
    p_usuario_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_historico JSONB;
    v_asignacion_id UUID;
    v_neto_cobrado NUMERIC;
BEGIN
    -- Validar formato de mes (01-12)
    IF p_mes !~ '^(0[1-9]|1[0-2])$' THEN
        RAISE EXCEPTION 'Mes inválido: %. Debe ser 01-12', p_mes;
    END IF;

    -- Validar año
    IF p_anio !~ '^\d{4}$' OR p_anio::INTEGER < 2000 OR p_anio::INTEGER > 2100 THEN
        RAISE EXCEPTION 'Año inválido: %', p_anio;
    END IF;

    -- Obtener asignación con lock
    SELECT id, historico_mensual
    INTO v_asignacion_id, v_historico
    FROM asignaciones_presupuestarias
    WHERE nombramiento_id = p_nombramiento_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Asignación no encontrada para nombramiento %', p_nombramiento_id;
    END IF;

    -- Verificar que el mes no exista
    IF v_historico -> p_anio -> p_mes IS NOT NULL THEN
        RAISE EXCEPTION 'El mes %/% ya existe', p_mes, p_anio;
    END IF;

    -- Calcular neto cobrado
    v_neto_cobrado := (p_data->>'devengado')::NUMERIC 
                    - (p_data->>'aporte_jubilatorio')::NUMERIC
                    - (p_data->>'aporte_ips')::NUMERIC
                    - COALESCE((p_data->>'otros_descuentos')::NUMERIC, 0);

    -- Construir nuevo histórico usando jsonb_set
    v_historico := jsonb_set(
        COALESCE(v_historico, '{}'::jsonb),
        ARRAY[p_anio, p_mes],
        p_data || jsonb_build_object(
            'neto_cobrado', v_neto_cobrado,
            'fecha_registro', CURRENT_TIMESTAMP,
            'usuario_registro', p_usuario_id
        ),
        true
    );

    -- Actualizar en una sola query
    UPDATE asignaciones_presupuestarias
    SET 
        historico_mensual = v_historico,
        fecha_ultima_actualizacion = CURRENT_TIMESTAMP,
        usuario_ultima_actualizacion = p_usuario_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_asignacion_id;

    -- Auditar con INSERT directo
    INSERT INTO historial_cambios (
        tabla_afectada,
        id_registro_afectado,
        campo_modificado,
        valor_nuevo,
        usuario_modificacion,
        motivo
    ) VALUES (
        'AsignacionPresupuestaria',
        v_asignacion_id::TEXT,
        'historicoMensual',
        (v_historico -> p_anio -> p_mes)::TEXT,
        p_usuario_id,
        format('Agregado mes %s/%s', p_mes, p_anio)
    );

    RETURN jsonb_build_object(
        'success', true,
        'data', v_historico -> p_anio -> p_mes,
        'message', format('Mes %s/%s agregado exitosamente', p_mes, p_anio)
    );
END;
$$;

-- =====================================================================
-- FUNCIÓN: Búsqueda Full-Text Optimizada
-- =====================================================================

CREATE OR REPLACE FUNCTION buscar_personas_optimizado(
    p_query TEXT,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    numero_cedula TEXT,
    nombres TEXT,
    apellidos TEXT,
    relevancia REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.numero_cedula,
        p.nombres,
        p.apellidos,
        ts_rank(
            to_tsvector('spanish', p.apellidos || ' ' || p.nombres),
            plainto_tsquery('spanish', p_query)
        ) AS relevancia
    FROM personas p
    WHERE 
        to_tsvector('spanish', p.apellidos || ' ' || p.nombres) @@ 
        plainto_tsquery('spanish', p_query)
        OR p.numero_cedula ILIKE '%' || p_query || '%'
    ORDER BY relevancia DESC, p.apellidos, p.nombres
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =====================================================================
-- FUNCIÓN: Reporte Mensual Optimizado (Materializado)
-- =====================================================================

CREATE OR REPLACE FUNCTION generar_reporte_mensual(
    p_anio TEXT,
    p_mes TEXT,
    p_facultad_id UUID DEFAULT NULL
) RETURNS TABLE (
    persona_ci TEXT,
    persona_nombre TEXT,
    cargo TEXT,
    dependencia TEXT,
    presupuestado NUMERIC,
    devengado NUMERIC,
    neto_cobrado NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pers.numero_cedula,
        pers.apellidos || ', ' || pers.nombres AS persona_nombre,
        c.nombre_cargo,
        f.nombre_facultad,
        (ap.historico_mensual -> p_anio -> p_mes ->> 'presupuestado')::NUMERIC,
        (ap.historico_mensual -> p_anio -> p_mes ->> 'devengado')::NUMERIC,
        (ap.historico_mensual -> p_anio -> p_mes ->> 'neto_cobrado')::NUMERIC
    FROM asignaciones_presupuestarias ap
    JOIN nombramientos n ON ap.nombramiento_id = n.id
    JOIN legajos l ON n.legajo_id = l.id
    JOIN personas pers ON l.persona_id = pers.id
    LEFT JOIN cargos c ON n.cargo_id = c.id
    LEFT JOIN facultades_dependencias f ON l.facultad_id = f.id
    WHERE 
        ap.historico_mensual -> p_anio -> p_mes IS NOT NULL
        AND (p_facultad_id IS NULL OR l.facultad_id = p_facultad_id)
    ORDER BY pers.apellidos, pers.nombres;
END;
$$;

-- Índice para la función de reporte
CREATE INDEX idx_asig_reporte_mensual 
ON asignaciones_presupuestarias 
USING gin(historico_mensual);
```

### 3.3 Configuración PostgreSQL Optimizada

#### postgresql.conf (Configuración recomendada)
```conf
# =====================================================================
# MEMORIA
# =====================================================================

# Memoria compartida (25% de RAM total)
shared_buffers = 4GB

# Memoria efectiva de caché (75% de RAM)
effective_cache_size = 12GB

# Memoria para operaciones de mantenimiento
maintenance_work_mem = 1GB

# Memoria de trabajo por query
work_mem = 50MB

# =====================================================================
# CHECKPOINTS
# =====================================================================

# Configuración de checkpoints para mejor rendimiento
checkpoint_completion_target = 0.9
wal_buffers = 16MB
max_wal_size = 4GB
min_wal_size = 1GB

# =====================================================================
# PLANNER
# =====================================================================

# Ajustes para SSD
random_page_cost = 1.1
effective_io_concurrency = 200

# Estadísticas más precisas
default_statistics_target = 100

# =====================================================================
# PARALELISMO
# =====================================================================

# Workers paralelos
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_worker_processes = 8

# =====================================================================
# LOGGING
# =====================================================================

# Log de queries lentas
log_min_duration_statement = 500  # 500ms
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Log de locks
log_lock_waits = on
deadlock_timeout = 1s

# =====================================================================
# AUTOVACUUM (Crucial para JSONB)
# =====================================================================

autovacuum = on
autovacuum_max_workers = 3
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05

# Más agresivo para tablas con JSONB
autovacuum_vacuum_cost_delay = 2ms
autovacuum_vacuum_cost_limit = 200

# =====================================================================
# CONEXIONES
# =====================================================================

max_connections = 100
```

---

## 💾 CACHING ESTRATÉGICO

### 4.1 Redis Cache Service

#### src/services/cache.service.ts
```typescript
import { createClient, RedisClientType } from 'redis';
import { env } from '../config/env.js';

export class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (env.REDIS_URL) {
      try {
        this.client = createClient({
          url: env.REDIS_URL,
          socket: {
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                return new Error('Redis: Max reconnection attempts reached');
              }
              return Math.min(retries * 100, 3000);
            },
          },
        });

        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('✅ Redis connected');
          this.isConnected = true;
        });

        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis, falling back to memory cache');
        this.client = null;
      }
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.client && this.isConnected) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback a memoria
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value;
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback a memoria
        this.memoryCache.set(key, {
          value,
          expiry: Date.now() + ttlSeconds * 1000,
        });
        
        // Limpiar expirados cada 1 minuto
        this.cleanExpiredMemoryCache();
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        const keys = await this.client.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        // Buscar en memoria
        const keysToDelete: string[] = [];
        for (const [key] of this.memoryCache) {
          if (key.includes(pattern)) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(key => this.memoryCache.delete(key));
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.flushDb();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  private cleanExpiredMemoryCache() {
    const now = Date.now();
    for (const [key, value] of this.memoryCache) {
      if (value.expiry < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
```

### 4.2 HTTP Cache Headers

#### src/plugins/http-cache.plugin.ts
```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    const url = request.url;

    // No cachear rutas de autenticación
    if (url.includes('/auth/')) {
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
      return payload;
    }

    // Cachear respuestas GET exitosas
    if (request.method === 'GET' && reply.statusCode === 200) {
      // Datos maestros (larga duración)
      if (url.includes('/cargos') || url.includes('/facultades') || 
          url.includes('/categorias-presupuestarias') || url.includes('/lineas-presupuestarias')) {
        reply.header('Cache-Control', 'public, max-age=3600'); // 1 hora
      }
      // Datos dinámicos (corta duración)
      else if (url.includes('/personas') || url.includes('/legajos')) {
        reply.header('Cache-Control', 'public, max-age=300'); // 5 minutos
      }
      // Histórico mensual (duración media)
      else if (url.includes('/historico')) {
        reply.header('Cache-Control', 'public, max-age=1800'); // 30 minutos
      }
    }

    // Agregar ETag para validación condicional
    if (payload && request.method === 'GET') {
      const etag = `"${Buffer.from(payload).toString('base64').slice(0, 27)}"`;
      reply.header('ETag', etag);

      // Validar If-None-Match
      if (request.headers['if-none-match'] === etag) {
        reply.code(304);
        return '';
      }
    }

    return payload;
  });
});
```

---

## 🔒 SEGURIDAD AVANZADA

### 5.1 Helmet Configuración Completa

#### src/plugins/helmet.plugin.ts
```typescript
import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  await app.register(helmet, {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },

    // Cross-Origin policies
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Expect-CT
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },

    // Frame Options
    frameguard: { action: 'deny' },

    // HSTS
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },

    // IE No Open
    ieNoOpen: true,

    // No Sniff
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Permissions Policy
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // XSS Filter
    xssFilter: true,
  });
});
```

### 5.2 Input Sanitization

#### src/utils/sanitizer.util.ts
```typescript
import { z } from 'zod';

/**
 * Sanitiza strings eliminando caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Eliminar caracteres HTML peligrosos
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/on\w+=/gi, ''); // Eliminar event handlers
}

/**
 * Sanitiza objetos recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Validar UUID
 */
export const uuidSchema = z.string().uuid('ID inválido');

/**
 * Validar CI paraguaya
 */
export function validarCIParaguaya(ci: string): boolean {
  // Formato: 1234567 o 1.234.567
  const cleaned = ci.replace(/\./g, '');
  return /^\d{6,7}$/.test(cleaned);
}

/**
 * Schema para prevenir SQL injection en búsquedas
 */
export const searchSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑ\-\.]+$/, 'Caracteres no permitidos en búsqueda');
```

### 5.3 RBAC (Role-Based Access Control)

#### src/middlewares/rbac.middleware.ts
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

export type Role = 'ADMIN' | 'RECURSOS_HUMANOS' | 'CONSULTA' | 'USUARIO';

const roleHierarchy: Record<Role, number> = {
  ADMIN: 4,
  RECURSOS_HUMANOS: 3,
  CONSULTA: 2,
  USUARIO: 1,
};

/**
 * Verificar si el usuario tiene el rol requerido o superior
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.rol as Role;

    if (!userRole) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'No autenticado',
      });
    }

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = Math.min(...allowedRoles.map(r => roleHierarchy[r]));

    if (userLevel < requiredLevel) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        yourRole: userRole,
      });
    }
  };
}

/**
 * Permisos específicos por acción
 */
export const permissions = {
  personas: {
    create: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    read: requireRole('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO'),
    update: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    delete: requireRole('ADMIN'),
  },
  legajos: {
    create: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    read: requireRole('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA'),
    update: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    delete: requireRole('ADMIN'),
  },
  nombramientos: {
    create: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    read: requireRole('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA'),
    update: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    delete: requireRole('ADMIN'),
  },
  historicoMensual: {
    create: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    read: requireRole('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA'),
    update: requireRole('ADMIN', 'RECURSOS_HUMANOS'),
    delete: requireRole('ADMIN'),
  },
};
```

---

## 🎨 OPTIMIZACIONES FRONTEND

### 6.1 Code Splitting y Lazy Loading

#### src/App.tsx (Optimizado)
```typescript
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';

// Lazy load de páginas
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const PersonasListPage = lazy(() => import('./pages/personas/PersonasListPage'));
const PersonaDetailPage = lazy(() => import('./pages/personas/PersonaDetailPage'));
const LegajosListPage = lazy(() => import('./pages/legajos/LegajosListPage'));
const HistoricoMensualPage = lazy(() => import('./pages/asignaciones/HistoricoMensualPage'));
const ReportesPage = lazy(() => import('./pages/reportes/ReportesPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* Rutas de Personas */}
          <Route path="/personas" element={<PersonasListPage />} />
          <Route path="/personas/:id" element={<PersonaDetailPage />} />
          
          {/* Rutas de Legajos */}
          <Route path="/legajos" element={<LegajosListPage />} />
          
          {/* Rutas de Asignaciones */}
          <Route path="/asignaciones/:nombramientoId/historico" element={<HistoricoMensualPage />} />
          
          {/* Reportes */}
          <Route path="/reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
```

### 6.2 Optimización de Imágenes y Assets

#### vite.config.ts (Optimizado)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    
    // Compresión Brotli
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    
    // Compresión Gzip
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    
    // Análisis de bundle
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    // Tamaño óptimo de chunks
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Code splitting manual
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'ui-vendor': ['bootstrap'],
        },
        
        // Nombres descriptivos
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
    
    // Source maps
    sourcemap: false, // Desactivar en producción
  },
  
  // Optimizaciones de servidor de desarrollo
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
  
  // Preview de producción
  preview: {
    port: 4173,
  },
});
```

### 6.3 Virtual Scrolling para Tablas Grandes

#### src/components/common/VirtualTable.tsx
```typescript
import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
  }>;
  rowHeight?: number;
  overscan?: number;
}

export function VirtualTable<T>({ 
  data, 
  columns, 
  rowHeight = 50,
  overscan = 5 
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div ref={parentRef} className="table-container" style={{ height: '600px', overflow: 'auto' }}>
      <table className="table table-sm">
        <thead className="sticky-top bg-light">
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: `${virtualizer.getTotalSize()}px` }}>
            <td colSpan={columns.length} style={{ padding: 0 }} />
          </tr>
          {virtualizer.getVirtualItems().map(virtualRow => {
            const item = data[virtualRow.index];
            return (
              <tr
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map(col => (
                  <td key={col.key}>{col.render(item)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### 6.4 Optimistic Updates con TanStack Query

#### src/hooks/useOptimisticPersonas.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { personasService } from '../services/personas.service';
import type { Persona, UpdatePersonaInput } from '../types';

export function useOptimisticUpdatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonaInput }) =>
      personasService.update(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['personas', id] });

      // Snapshot del valor anterior
      const previousPersona = queryClient.getQueryData<Persona>(['personas', id]);

      // Actualizar optimistically
      if (previousPersona) {
        queryClient.setQueryData<Persona>(['personas', id], {
          ...previousPersona,
          ...data,
        });
      }

      return { previousPersona };
    },
    
    // Si falla, rollback
    onError: (err, variables, context) => {
      if (context?.previousPersona) {
        queryClient.setQueryData(
          ['personas', variables.id],
          context.previousPersona
        );
      }
    },
    
    // Siempre refetch después
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['personas', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
  });
}
```

---

## 📊 MONITOREO Y OBSERVABILIDAD

### 7.1 Métricas con Prometheus

#### src/plugins/metrics.plugin.ts
```typescript
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export default fp(async (app: FastifyInstance) => {
  const register = new Registry();

  // Métricas de requests HTTP
  const httpRequestDuration = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
    registers: [register],
  });

  const httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  // Métricas de base de datos
  const dbQueryDuration = new Histogram({
    name: 'db_query_duration_ms',
    help: 'Duration of database queries in ms',
    labelNames: ['operation', 'model'],
    buckets: [1, 5, 10, 50, 100, 500, 1000, 5000],
    registers: [register],
  });

  // Métricas de caché
  const cacheHits = new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    registers: [register],
  });

  const cacheMisses = new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    registers: [register],
  });

  // Métricas de sistema
  const activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
  });

  // Hook para medir requests
  app.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
    activeConnections.inc();
  });

  app.addHook('onResponse', async (request, reply) => {
    const duration = Date.now() - (request.startTime || Date.now());
    const route = request.routeOptions.url || 'unknown';
    
    httpRequestDuration.observe(
      { method: request.method, route, status_code: reply.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: request.method,
      route,
      status_code: reply.statusCode,
    });
    
    activeConnections.dec();
  });

  // Endpoint para Prometheus
  app.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return register.metrics();
  });

  // Decorar app con métricas
  app.decorate('metrics', {
    httpRequestDuration,
    httpRequestTotal,
    dbQueryDuration,
    cacheHits,
    cacheMisses,
    activeConnections,
  });
});
```

### 7.2 Health Checks Avanzados

#### src/routes/health.routes.ts
```typescript
import { FastifyInstance } from 'fastify';
import { checkDatabaseHealth } from '../config/database.js';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  checks: {
    database: boolean;
    cache?: boolean;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export default async function healthRoutes(app: FastifyInstance) {
  // Health check básico
  app.get('/health', async (request, reply) => {
    reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Health check detallado
  app.get('/health/detailed', async (request, reply) => {
    const dbHealthy = await checkDatabaseHealth();
    
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    const health: HealthStatus = {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbHealthy,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.round(memoryPercentage),
        },
      },
    };

    reply.code(health.status === 'ok' ? 200 : 503).send(health);
  });

  // Liveness probe (Kubernetes)
  app.get('/health/live', async (request, reply) => {
    reply.send({ alive: true });
  });

  // Readiness probe (Kubernetes)
  app.get('/health/ready', async (request, reply) => {
    const ready = await checkDatabaseHealth();
    reply.code(ready ? 200 : 503).send({ ready });
  });
}
```

---

## ✅ CHECKLIST DE MEJORES PRÁCTICAS

### Backend
- [x] **Arquitectura en capas** (Repository → Service → Controller)
- [x] **Inyección de dependencias** con Container
- [x] **Connection pooling** optimizado de Prisma
- [x] **Índices compuestos** y GIN para JSONB
- [x] **Funciones SQL** optimizadas y transaccionales
- [x] **Rate limiting** con Redis
- [x] **Caching estratégico** (Redis + fallback memoria)
- [x] **Logging estructurado** con Pino
- [x] **Seguridad completa** (Helmet + CSP + RBAC)
- [x] **Input sanitization** con Zod
- [x] **Métricas Prometheus**
- [x] **Health checks** completos

### Frontend
- [x] **Code splitting** y lazy loading
- [x] **Virtual scrolling** para tablas grandes
- [x] **Optimistic updates** con TanStack Query
- [x] **Bundle optimization** con Vite
- [x] **HTTP caching** con headers
- [x] **Compresión Brotli/Gzip**
- [x] **Análisis de bundle** con Visualizer

### Base de Datos
- [x] **Índices optimizados** (B-tree + GIN + parciales)
- [x] **Funciones almacenadas** para operaciones complejas
- [x] **Estadísticas extendidas** para query planner
- [x] **Configuración PostgreSQL** ajustada
- [x] **Autovacuum optimizado** para JSONB

### DevOps
- [x] **Docker multi-stage** builds
- [x] **Health checks** en containers
- [x] **CI/CD** con GitHub Actions
- [x] **Monitoreo** con Prometheus
- [x] **Logging centralizado**

---

## 📈 BENCHMARKS ESPERADOS

### Backend Performance

| Métrica | Objetivo | Notas |
|---------|----------|-------|
| Tiempo de respuesta promedio | < 50ms | Para queries simples |
| P95 | < 100ms | 95% de requests |
| P99 | < 500ms | 99% de requests |
| Throughput | 1000+ req/s | En hardware estándar |
| Concurrencia | 100+ conexiones | Sin degradación |

### Frontend Performance

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Bundle size (gzipped) | < 200KB | Webpack Bundle Analyzer |
| Lighthouse Score | > 90 | Chrome DevTools |

### Database Performance

| Métrica | Objetivo | Notas |
|---------|----------|-------|
| Query simple | < 10ms | Con índices |
| Query JSONB | < 50ms | Con índice GIN |
| Transacción compleja | < 100ms | Con locks optimizados |
| Reporte mensual | < 500ms | Con función SQL |

---

**Última actualización**: 2 de febrero de 2026  
**Versión**: 1.0  
**Estado**: Mejores prácticas implementadas
