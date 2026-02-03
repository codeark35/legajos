# Plan de Trabajo: Rediseño Sistema de Asignaciones Presupuestarias

## Objetivo
Rediseñar el modelo de asignaciones presupuestarias para permitir que múltiples personas compartan la misma asignación y que una persona pueda cambiar de asignación en diferentes períodos.

---

## FASE 1: Análisis y Diseño (1-2 horas)

### ✅ Tareas Completadas
- [x] Identificar problema del modelo actual (relación 1:1)
- [x] Diseñar modelo optimizado (tabla intermedia + JSONB)
- [x] Validar con usuario el concepto de histórico mensual
- [x] Decidir usar JSONB para eficiencia (evitar 240K registros)

### 📋 Tareas Pendientes
- [ ] Revisar datos actuales en la BD (cantidad de asignaciones existentes)
- [ ] Diseñar script de migración de datos
- [ ] Definir estructura exacta del JSONB historicoMensual

---

## FASE 2: Modificación del Schema Prisma ✅ COMPLETADA

### 2.1 Backup de la Base de Datos
✅ Omitido - No se requiere preservar datos existentes

### 2.2 Modificar Schema ✅
**Archivo**: `server/prisma/schema.prisma`

#### Cambios realizados:

✅ **1. Eliminada relación 1:1 en Nombramiento**
```prisma
model Nombramiento {
  // ELIMINADO: asignacionPresupuestaria AsignacionPresupuestaria?
  
  // AGREGADO:
  asignaciones NombramientoAsignacion[]
}
```

✅ **2. Modificada AsignacionPresupuestaria**
```prisma
model AsignacionPresupuestaria {
  // ELIMINADO:
  // nombramientoId String @unique
  // nombramiento   Nombramiento @relation(...)
  // historicoMensual Json
  
  // AGREGADO:
  codigo                      String?   @unique
  descripcion                 String?
  vigente                     Boolean   @default(true)
  historicoMensualConsolidado Json      @default("{}") @map("historico_mensual_consolidado")
  asignacionesNombramientos   NombramientoAsignacion[]
}
```

✅ **3. Creada nueva tabla NombramientoAsignacion**
```prisma
model NombramientoAsignacion {
  id                          String    @id @default(uuid())
  nombramientoId              String
  asignacionPresupuestariaId  String
  fechaInicio                 DateTime
  fechaFin                    DateTime?
  historicoMensual            Json      @default("{}")
  observaciones               String?
  // ... relaciones y timestamps
}
```

### 2.3 Generar Migración ✅
```bash
✅ Ejecutado: npx prisma migrate dev --name rediseno_asignaciones_tabla_intermedia
✅ Migración aplicada: 20260203201930_rediseno_asignaciones_tabla_intermedia
✅ Prisma Client regenerado
```

### 2.4 Cambios en Base de Datos ✅
- ✅ Eliminada columna `nombramiento_id` de `asignaciones_presupuestarias`
- ✅ Eliminada columna `historico_mensual` de `asignaciones_presupuestarias`  
- ✅ Agregadas columnas: `codigo`, `descripcion`, `vigente`, `historico_mensual_consolidado`
- ✅ Creada tabla `nombramiento_asignaciones` con índices
- ✅ Establecidas foreign keys con CASCADE

---

## FASE 3: Script de Migración de Datos (1 hora)

### 3.1 Crear Script de Migración
**Archivo**: `server/prisma/migrations/migrate-asignaciones.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Iniciando migración de asignaciones presupuestarias...');
  
  // 1. Obtener todas las asignaciones existentes con relación 1:1
  const asignacionesExistentes = await prisma.asignacionPresupuestaria.findMany({
    include: {
      nombramiento: {
        include: {
          legajo: {
            include: { persona: true }
          }
        }
      }
    }
  });
  
  console.log(`📊 Encontradas ${asignacionesExistentes.length} asignaciones existentes`);
  
  // 2. Para cada asignación, crear registro en tabla intermedia
  for (const asignacion of asignacionesExistentes) {
    if (!asignacion.nombramiento) continue;
    
    console.log(`  Migrando asignación ${asignacion.id}...`);
    
    // Crear código si no existe
    const codigo = asignacion.codigo || 
      `ASG-${asignacion.categoriaPresupuestariaId?.substring(0, 8) || 'XXX'}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Actualizar asignación con código
    await prisma.asignacionPresupuestaria.update({
      where: { id: asignacion.id },
      data: { 
        codigo,
        vigente: asignacion.vigente ?? true,
        historicoMensualConsolidado: asignacion.historicoMensual || {}
      }
    });
    
    // Crear registro en tabla intermedia
    await prisma.nombramientoAsignacion.create({
      data: {
        nombramientoId: asignacion.nombramientoId,
        asignacionPresupuestariaId: asignacion.id,
        fechaInicio: asignacion.nombramiento.fechaInicio,
        fechaFin: asignacion.nombramiento.fechaFin,
        historicoMensual: asignacion.historicoMensual || {},
        usuarioCarga: 'MIGRACION_AUTOMATICA',
        fechaCarga: new Date(),
        observaciones: 'Migrado desde modelo anterior'
      }
    });
    
    console.log(`  ✅ Migrada asignación ${codigo}`);
  }
  
  console.log('✨ Migración completada exitosamente');
}

migrate()
  .catch((e) => {
    console.error('❌ Error en migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 3.2 Agregar Script al package.json
```json
{
  "scripts": {
    "migrate:asignaciones": "ts-node prisma/migrations/migrate-asignaciones.ts"
  }
}
```

### 3.3 Ejecutar Migración
```bash
# 1. Aplicar cambios de schema
npx prisma migrate deploy

# 2. Ejecutar script de migración de datos
npm run migrate:asignaciones

# 3. Verificar en Prisma Studio
npm run prisma:studio
```

---

## FASE 4: Backend - Módulo NombramientoAsignacion (2-3 horas)

### 4.1 Crear Módulo
```bash
cd /home/user/legajos/server/src/modules
nest g module nombramiento-asignaciones
nest g service nombramiento-asignaciones
nest g controller nombramiento-asignaciones
```

### 4.2 DTOs a Crear

**create-nombramiento-asignacion.dto.ts**
```typescript
export class CreateNombramientoAsignacionDto {
  nombramientoId: string;
  asignacionPresupuestariaId: string;
  fechaInicio: string;
  fechaFin?: string;
  observaciones?: string;
}
```

**update-historico-mensual.dto.ts**
```typescript
export class UpdateHistoricoMensualDto {
  anio: number;
  mes: number; // 1-12
  presupuestado: number;
  devengado?: number;
  aportesPatronales?: number;
  aportesPersonales?: number;
  descuentos?: number;
  netoRecibido?: number;
  observaciones?: string;
}
```

### 4.3 Endpoints a Implementar

```typescript
// nombramiento-asignaciones.controller.ts

// 1. Crear relación nombramiento-asignación
POST /api/v1/nombramiento-asignaciones
{
  "nombramientoId": "uuid",
  "asignacionPresupuestariaId": "uuid",
  "fechaInicio": "2024-01-01",
  "fechaFin": "2024-12-31"
}

// 2. Obtener todas las asignaciones de un nombramiento
GET /api/v1/nombramiento-asignaciones/nombramiento/:nombramientoId

// 3. Actualizar histórico mensual
PATCH /api/v1/nombramiento-asignaciones/:id/historico/:anio/:mes
{
  "presupuestado": 4000000,
  "devengado": 3800000,
  "aportesPatronales": 720000,
  "aportesPersonales": 360000,
  "netoRecibido": 2720000
}

// 4. Obtener histórico mensual de un período
GET /api/v1/nombramiento-asignaciones/:id/historico?anio=2024&mes=1

// 5. Finalizar asignación (poner fechaFin)
PATCH /api/v1/nombramiento-asignaciones/:id/finalizar
{
  "fechaFin": "2024-12-31"
}

// 6. Obtener todas las personas con una asignación específica en un mes
GET /api/v1/nombramiento-asignaciones/asignacion/:asignacionId/mes/:anio/:mes
```

### 4.4 Lógica del Servicio

**nombramiento-asignaciones.service.ts**
```typescript
async updateHistoricoMensual(
  id: string,
  anio: number,
  mes: number,
  data: UpdateHistoricoMensualDto
) {
  const asignacion = await this.prisma.nombramientoAsignacion.findUnique({
    where: { id }
  });
  
  const historico = asignacion.historicoMensual as any || {};
  const mesKey = `${anio}-${mes.toString().padStart(2, '0')}`;
  
  historico[mesKey] = {
    presupuestado: data.presupuestado,
    devengado: data.devengado || data.presupuestado,
    aportesPatronales: data.aportesPatronales || 0,
    aportesPersonales: data.aportesPersonales || 0,
    descuentos: data.descuentos || 0,
    netoRecibido: data.netoRecibido || 0,
    observaciones: data.observaciones,
    fechaActualizacion: new Date().toISOString()
  };
  
  return this.prisma.nombramientoAsignacion.update({
    where: { id },
    data: { historicoMensual: historico }
  });
}
```

---

## FASE 5: Backend - Actualizar AsignacionesPresupuestariasModule (1-2 horas)

### 5.1 Modificar AsignacionesPresupuestariasService

**Cambios principales:**

1. **Eliminar validación de nombramientoId único**
```typescript
// ELIMINAR esta validación:
// const existente = await this.prisma.asignacionPresupuestaria.findUnique({
//   where: { nombramientoId }
// });
```

2. **Actualizar método create**
```typescript
async create(data: CreateAsignacionPresupuestariaDto) {
  // Ya no requiere nombramientoId
  // Generar código automático si no viene
  const codigo = data.codigo || this.generarCodigo(data);
  
  return this.prisma.asignacionPresupuestaria.create({
    data: {
      codigo,
      descripcion: data.descripcion,
      categoriaPresupuestariaId: data.categoriaPresupuestariaId,
      lineaPresupuestariaId: data.lineaPresupuestariaId,
      objetoGasto: data.objetoGasto,
      salarioBase: data.salarioBase,
      moneda: data.moneda || 'PYG',
      vigente: true
    }
  });
}
```

3. **Nuevo endpoint: Obtener asignaciones disponibles**
```typescript
GET /api/v1/asignaciones-presupuestarias/disponibles
// Retorna todas las asignaciones vigentes (sin filtro de nombramiento)
```

### 5.2 Actualizar DTOs

**create-asignacion-presupuestaria.dto.ts**
```typescript
export class CreateAsignacionPresupuestariaDto {
  // ELIMINAR: nombramientoId
  
  // AGREGAR:
  codigo?: string;
  descripcion?: string;
  
  // Mantener:
  categoriaPresupuestariaId?: string;
  lineaPresupuestariaId?: string;
  objetoGasto?: string;
  salarioBase: number;
  moneda?: string;
}
```

---

## FASE 6: Backend - Endpoint para Nombramientos Calculados (1 hora)

### 6.1 Agregar al NombramientosController

```typescript
// nombramientos.controller.ts

@Get(':id/asignaciones-historico')
@ApiOperation({ summary: 'Obtener histórico de asignaciones de un nombramiento (agrupado)' })
obtenerHistoricoAsignaciones(@Param('id') id: string) {
  return this.nombramientosService.obtenerHistoricoAsignaciones(id);
}
```

### 6.2 Implementar en NombramientosService

```typescript
async obtenerHistoricoAsignaciones(nombramientoId: string) {
  const asignaciones = await this.prisma.nombramientoAsignacion.findMany({
    where: { nombramientoId },
    include: {
      asignacionPresupuestaria: {
        include: {
          categoriaPresupuestaria: true,
          lineaPresupuestaria: true
        }
      }
    },
    orderBy: { fechaInicio: 'asc' }
  });
  
  // Agrupar períodos consecutivos con misma asignación
  const periodos = [];
  let periodoActual = null;
  
  for (const asig of asignaciones) {
    if (!periodoActual || 
        periodoActual.asignacionId !== asig.asignacionPresupuestariaId) {
      
      if (periodoActual) periodos.push(periodoActual);
      
      periodoActual = {
        asignacionId: asig.asignacionPresupuestariaId,
        codigo: asig.asignacionPresupuestaria.codigo,
        categoria: asig.asignacionPresupuestaria.categoriaPresupuestaria?.codigoCategoria,
        linea: asig.asignacionPresupuestaria.lineaPresupuestaria?.codigoLinea,
        fechaInicio: asig.fechaInicio,
        fechaFin: asig.fechaFin,
        salarioBase: asig.asignacionPresupuestaria.salarioBase,
        historicoMensual: asig.historicoMensual
      };
    } else {
      // Extender período actual
      periodoActual.fechaFin = asig.fechaFin;
      // Combinar históricos
      periodoActual.historicoMensual = {
        ...periodoActual.historicoMensual,
        ...asig.historicoMensual
      };
    }
  }
  
  if (periodoActual) periodos.push(periodoActual);
  
  return periodos;
}
```

---

## FASE 7: Frontend - Actualizar Servicios (30 min)

### 7.1 Crear nombramientoAsignaciones.service.ts

**Archivo**: `client/src/services/nombramientoAsignaciones.service.ts`

```typescript
import apiService from './api.service';

export interface NombramientoAsignacion {
  id: string;
  nombramientoId: string;
  asignacionPresupuestariaId: string;
  fechaInicio: string;
  fechaFin?: string;
  historicoMensual: Record<string, any>;
}

const nombramientoAsignacionesService = {
  create: async (data: any) => {
    const response = await apiService.post('/nombramiento-asignaciones', data);
    return response.data.data;
  },
  
  getByNombramiento: async (nombramientoId: string) => {
    const response = await apiService.get(`/nombramiento-asignaciones/nombramiento/${nombramientoId}`);
    return response.data.data;
  },
  
  updateHistoricoMensual: async (id: string, anio: number, mes: number, data: any) => {
    const response = await apiService.patch(
      `/nombramiento-asignaciones/${id}/historico/${anio}/${mes}`,
      data
    );
    return response.data.data;
  },
  
  finalizar: async (id: string, fechaFin: string) => {
    const response = await apiService.patch(
      `/nombramiento-asignaciones/${id}/finalizar`,
      { fechaFin }
    );
    return response.data.data;
  }
};

export default nombramientoAsignacionesService;
```

### 7.2 Actualizar asignaciones.service.ts

```typescript
// Eliminar referencia a nombramientoId en interfaces y llamadas
export interface CreateAsignacionDto {
  // ELIMINAR: nombramientoId
  
  // AGREGAR:
  codigo?: string;
  descripcion?: string;
  
  categoriaPresupuestariaId?: string;
  lineaPresupuestariaId?: string;
  objetoGasto?: string;
  salarioBase: number;
  moneda?: string;
}
```

---

## FASE 8: Frontend - Nueva Página de Gestión (2-3 horas)

### 8.1 Crear Página: Asignar Presupuesto a Nombramiento

**Archivo**: `client/src/pages/NombramientoAsignacionFormPage.tsx`

Componente que permite:
- Seleccionar un nombramiento
- Seleccionar una asignación presupuestaria (de las disponibles)
- Definir fechaInicio y fechaFin
- Crear la relación

### 8.2 Crear Página: Cargar Gestión Histórica Mensual

**Archivo**: `client/src/pages/GestionHistoricaPage.tsx`

Componente que permite:
- Seleccionar año y mes
- Ver lista de nombramientos activos ese mes
- Para cada nombramiento, cargar:
  - Presupuestado
  - Devengado
  - Aportes
  - Descuentos
  - Neto recibido

### 8.3 Actualizar AsignacionFormPage

**Cambios**:
- Eliminar campo nombramientoId
- Agregar campos código y descripción
- Hacer que sea solo para crear/editar asignaciones presupuestarias (plazas)
- No relacionar directamente con nombramientos

### 8.4 Actualizar PersonaDetailPage / LegajoDetail

**Cambios**:
- Mostrar nombramientos calculados (períodos agrupados)
- Botón para ver detalle de histórico mensual
- Modal con tabla de histórico mes a mes

---

## FASE 9: Frontend - Actualizar Rutas (15 min)

### 9.1 Actualizar App.tsx

```typescript
// RUTAS NUEVAS:
<Route path="/nombramiento-asignaciones/nueva" element={<NombramientoAsignacionFormPage />} />
<Route path="/nombramiento-asignaciones/:id" element={<NombramientoAsignacionFormPage />} />
<Route path="/gestion-historica" element={<GestionHistoricaPage />} />

// RUTAS ACTUALIZADAS:
<Route path="/asignaciones/nueva" element={<AsignacionFormPage />} /> // Sin nombramiento
```

### 9.2 Actualizar Menú de Navegación

Agregar opciones:
- "Asignaciones Presupuestarias" (catálogo de plazas)
- "Asignar a Nombramientos" (relacionar)
- "Gestión Histórica Mensual" (cargar datos mensuales)

---

## FASE 10: Testing y Validación (2-3 horas)

### 10.1 Tests Backend

```typescript
// nombramiento-asignaciones.service.spec.ts
describe('NombramientoAsignacionesService', () => {
  it('debe crear relación nombramiento-asignación');
  it('debe actualizar histórico mensual correctamente');
  it('debe obtener asignaciones de un nombramiento');
  it('debe finalizar asignación con fechaFin');
  it('debe validar que fechaFin >= fechaInicio');
  it('debe evitar solapamiento de fechas para mismo nombramiento');
});
```

### 10.2 Tests Frontend

```typescript
// NombramientoAsignacionFormPage.test.tsx
describe('NombramientoAsignacionFormPage', () => {
  it('debe listar asignaciones disponibles');
  it('debe crear relación correctamente');
  it('debe validar fechas');
  it('debe mostrar error si nombramiento ya tiene asignación vigente');
});
```

### 10.3 Tests E2E

**Escenarios a probar:**
1. Crear asignación presupuestaria
2. Asignar a nombramiento
3. Cargar histórico mensual
4. Ver en detalle de legajo
5. Cambiar asignación (finalizar una, crear nueva)
6. Ver que múltiples personas tienen misma asignación

---

## FASE 11: Documentación (1 hora)

### 11.1 Actualizar README.md

Documentar:
- Nuevo modelo de datos
- Flujo de trabajo
- Endpoints de API
- Ejemplos de uso

### 11.2 Documentación de API (Swagger)

Asegurar que todos los endpoints estén documentados con:
- `@ApiOperation()`
- `@ApiResponse()`
- Ejemplos de request/response

### 11.3 Guía de Usuario

Crear documento con:
- Cómo crear asignaciones presupuestarias
- Cómo asignar a nombramientos
- Cómo cargar gestión histórica mensual
- Cómo interpretar nombramientos calculados

---

## FASE 12: Deployment (30 min)

### 12.1 Checklist Pre-Deploy

- [ ] Backup completo de BD
- [ ] Todas las migraciones probadas en desarrollo
- [ ] Tests pasando
- [ ] Código revisado
- [ ] Documentación actualizada

### 12.2 Ejecutar en Producción

```bash
# 1. Backup
pg_dump produccion > backup_pre_migracion.sql

# 2. Deploy backend
cd server
npm run build
npx prisma migrate deploy

# 3. Ejecutar migración de datos
npm run migrate:asignaciones

# 4. Verificar
npm run prisma:studio

# 5. Deploy frontend
cd ../client
npm run build
# Subir a servidor
```

---

## RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Backend (NestJS)

**Nuevos archivos:**
- `src/modules/nombramiento-asignaciones/nombramiento-asignaciones.module.ts`
- `src/modules/nombramiento-asignaciones/nombramiento-asignaciones.controller.ts`
- `src/modules/nombramiento-asignaciones/nombramiento-asignaciones.service.ts`
- `src/modules/nombramiento-asignaciones/dto/create-nombramiento-asignacion.dto.ts`
- `src/modules/nombramiento-asignaciones/dto/update-historico-mensual.dto.ts`
- `prisma/migrations/migrate-asignaciones.ts`

**Archivos a modificar:**
- `prisma/schema.prisma` (cambios principales)
- `src/modules/asignaciones-presupuestarias/asignaciones-presupuestarias.service.ts`
- `src/modules/asignaciones-presupuestarias/dto/create-asignacion-presupuestaria.dto.ts`
- `src/modules/nombramientos/nombramientos.service.ts`
- `src/modules/nombramientos/nombramientos.controller.ts`

### Frontend (React)

**Nuevos archivos:**
- `src/services/nombramientoAsignaciones.service.ts`
- `src/pages/NombramientoAsignacionFormPage.tsx`
- `src/pages/GestionHistoricaPage.tsx`
- `src/components/HistoricoMensualTable.tsx`
- `src/hooks/useNombramientoAsignaciones.ts`

**Archivos a modificar:**
- `src/pages/AsignacionFormPage.tsx`
- `src/pages/AsignacionDetailPage.tsx`
- `src/pages/PersonaDetailPage.tsx` (o LegajoDetailPage)
- `src/services/asignaciones.service.ts`
- `src/types/index.ts`
- `src/App.tsx` (rutas)

---

## ESTIMACIÓN DE TIEMPOS

| Fase | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Análisis y Diseño | 1-2 horas |
| 2 | Modificación Schema Prisma | 30 min |
| 3 | Script Migración de Datos | 1 hora |
| 4 | Backend: Módulo NombramientoAsignacion | 2-3 horas |
| 5 | Backend: Actualizar AsignacionesModule | 1-2 horas |
| 6 | Backend: Nombramientos Calculados | 1 hora |
| 7 | Frontend: Actualizar Servicios | 30 min |
| 8 | Frontend: Nueva Página de Gestión | 2-3 horas |
| 9 | Frontend: Actualizar Rutas | 15 min |
| 10 | Testing y Validación | 2-3 horas |
| 11 | Documentación | 1 hora |
| 12 | Deployment | 30 min |
| **TOTAL** | | **12-18 horas** |

---

## PRIORIDADES

### Prioridad ALTA (Crítico - Hacer primero)
1. ✅ Fase 2: Modificar Schema Prisma
2. ✅ Fase 3: Migración de datos existentes
3. ✅ Fase 4: Backend módulo NombramientoAsignacion
4. ✅ Fase 5: Actualizar AsignacionesPresupuestariasModule

### Prioridad MEDIA (Importante)
5. Fase 7: Frontend - Actualizar servicios
6. Fase 8: Frontend - Páginas de gestión
7. Fase 6: Backend - Nombramientos calculados

### Prioridad BAJA (Puede esperar)
8. Fase 10: Tests completos
9. Fase 11: Documentación detallada

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Pérdida de datos en migración | ALTO | Backup completo antes de migrar |
| Downtime prolongado | MEDIO | Probar migración en desarrollo primero |
| Bugs en código existente | MEDIO | Tests exhaustivos antes de deploy |
| Usuario no entiende nuevo flujo | MEDIO | Documentación y capacitación |
| Performance de JSONB | BAJO | Índices GIN en PostgreSQL |

---

## PRÓXIMO PASO

**¿Comenzamos con la Fase 2: Modificación del Schema Prisma?**

Esto incluye:
1. Backup de la BD actual
2. Modificar `schema.prisma`
3. Generar migración
4. Revisar SQL antes de aplicar

**¿Procedo?**
