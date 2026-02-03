# Propuesta de Rediseño: Asignaciones Presupuestarias

## Problema Actual

El modelo actual tiene una relación **1:1** entre `Nombramiento` y `AsignacionPresupuestaria`:

```prisma
model AsignacionPresupuestaria {
  nombramientoId  String @unique  // ❌ PROBLEMA: Solo una persona por asignación
  nombramiento    Nombramiento @relation(...)
}
```

### Limitaciones:
- ❌ Una asignación presupuestaria queda "bloqueada" para una sola persona
- ❌ No permite que múltiples personas compartan la misma categoría/línea
- ❌ No permite cambios mensuales de asignación para una persona
- ❌ No refleja la realidad presupuestaria

## Modelo Correcto

### Concepto:
1. **AsignacionPresupuestaria**: Es una "plaza presupuestaria" definida por categoría + línea + salario base
2. **HistoricoMensual**: Cada mes, cada persona se asigna a UNA plaza presupuestaria específica
3. **Nombramiento**: Se visualiza agrupando períodos consecutivos con la misma asignación

### Schema Correcto:

```prisma
// AsignacionPresupuestaria es independiente (no depende de nombramiento)
model AsignacionPresupuestaria {
  id                          String    @id @default(uuid())
  // ❌ ELIMINAR: nombramientoId
  
  categoriaPresupuestariaId   String?   @map("categoria_presupuestaria_id")
  lineaPresupuestariaId       String?   @map("linea_presupuestaria_id")
  objetoGasto                 String?   @map("objeto_gasto")
  salarioBase                 Decimal   @map("salario_base") @db.Decimal(15, 2)
  moneda                      String    @default("PYG")
  
  // Metadata
  codigo                      String?   @unique // Ej: "CAT-L33-001"
  descripcion                 String?
  vigente                     Boolean   @default(true)
  
  // Relaciones
  categoriaPresupuestaria     CategoriaPresupuestaria? @relation(...)
  lineaPresupuestaria         LineaPresupuestaria? @relation(...)
  historicosMensuales         HistoricoMensual[]  // ✅ Relación 1:N
  
  @@map("asignaciones_presupuestarias")
}

// Histórico Mensual: Relaciona persona + mes + asignación
model HistoricoMensual {
  id                          String    @id @default(uuid())
  nombramientoId              String    @map("nombramiento_id")
  asignacionPresupuestariaId  String    @map("asignacion_presupuestaria_id")
  
  // Período
  anio                        Int
  mes                         Int       // 1-12
  
  // Datos del mes
  presupuestado               Decimal   @db.Decimal(15, 2)
  devengado                   Decimal?  @db.Decimal(15, 2)
  aportesPatronales           Decimal?  @map("aportes_patronales") @db.Decimal(15, 2)
  aportesPersonales           Decimal?  @map("aportes_personales") @db.Decimal(15, 2)
  descuentos                  Decimal?  @db.Decimal(15, 2)
  netoRecibido                Decimal?  @map("neto_recibido") @db.Decimal(15, 2)
  
  // Metadata
  observaciones               String?
  usuarioCarga                String?   @map("usuario_carga")
  fechaCarga                  DateTime  @default(now()) @map("fecha_carga")
  
  // Relaciones
  nombramiento                Nombramiento @relation(fields: [nombramientoId], references: [id])
  asignacionPresupuestaria    AsignacionPresupuestaria @relation(fields: [asignacionPresupuestariaId], references: [id])
  
  @@unique([nombramientoId, anio, mes])
  @@map("historico_mensual")
  @@index([nombramientoId])
  @@index([asignacionPresupuestariaId])
  @@index([anio, mes])
}

// Nombramiento: Ya no tiene relación directa con asignación
model Nombramiento {
  id                    String    @id @default(uuid())
  legajoId              String    @map("legajo_id")
  cargoId               String?   @map("cargo_id")
  // ... otros campos ...
  
  // Relaciones
  legajo                Legajo    @relation(...)
  cargo                 Cargo?    @relation(...)
  historicosMensuales   HistoricoMensual[]  // ✅ Relación 1:N
  
  // ❌ ELIMINAR: asignacionPresupuestaria AsignacionPresupuestaria?
  
  @@map("nombramientos")
}
```

## Flujo de Trabajo

### 1. Crear Asignación Presupuestaria (independiente)
```typescript
// Crear una plaza presupuestaria
POST /asignaciones-presupuestarias
{
  "codigo": "DOC-L33-001",
  "descripcion": "Docente Técnico - Categoría L33 - Línea 100",
  "categoriaPresupuestariaId": "uuid-L33",
  "lineaPresupuestariaId": "uuid-100",
  "salarioBase": 4000000,
  "moneda": "PYG",
  "vigente": true
}
```

### 2. Cargar Gestión Histórica Mensual
```typescript
// Asignar persona a plaza presupuestaria para enero 2024
POST /historico-mensual
{
  "nombramientoId": "uuid-nombramiento",
  "asignacionPresupuestariaId": "uuid-asignacion",
  "anio": 2024,
  "mes": 1,
  "presupuestado": 4000000,
  "devengado": 3800000,
  "aportesPatronales": 720000,
  "aportesPersonales": 360000,
  "descuentos": 40000,
  "netoRecibido": 2680000
}
```

### 3. Visualizar en Detalle de Legajo
```typescript
// Al ver el legajo, agrupar períodos consecutivos con misma asignación
GET /legajos/:id/nombramientos-calculados

// Backend calcula:
Nombramiento 1:
  - Cargo: Docente Técnico
  - Período: Enero 2020 - Diciembre 2023 (48 meses)
  - Asignación: CAT-L33-001 (Categoría L33, Línea 100)
  
Nombramiento 2:
  - Cargo: Docente Técnico
  - Período: Enero 2024 - Presente (3 meses)
  - Asignación: CAT-UU5-002 (Categoría UU5, Línea 200) // Cambió de asignación
```

## Ventajas del Nuevo Modelo

✅ **Múltiples personas** pueden tener la misma asignación presupuestaria
✅ **Cambios mensuales**: Una persona puede cambiar de asignación cada mes
✅ **Histórico completo**: Se registra mes a mes qué asignación tuvo cada persona
✅ **Flexibilidad**: Una asignación puede tener 0, 1 o N personas asignadas
✅ **Realista**: Refleja cómo funciona realmente el presupuesto universitario
✅ **Auditable**: Histórico mensual completo de movimientos

## Migración

### Pasos:
1. ✅ Crear tabla `historico_mensual`
2. ✅ Migrar datos existentes de JSONB a tabla relacional
3. ✅ Eliminar relación 1:1 entre Nombramiento y AsignacionPresupuestaria
4. ✅ Actualizar controladores y servicios
5. ✅ Actualizar frontend

### Comando de migración:
```bash
# Crear nueva migración
npx prisma migrate dev --name rediseno_asignaciones_historico_mensual

# Ejecutar script de migración de datos
npm run migrate:historico-mensual
```

## Impacto en el Sistema

### Backend:
- ✅ Nuevo módulo: `HistoricoMensualModule`
- ✅ Eliminar campo `nombramientoId` de AsignacionPresupuestaria
- ✅ Nuevo endpoint: POST `/historico-mensual`
- ✅ Nuevo endpoint: GET `/legajos/:id/nombramientos-calculados`
- ✅ Actualizar lógica de asignaciones

### Frontend:
- ✅ Nueva página: Cargar Gestión Histórica Mensual
- ✅ Actualizar formulario de asignaciones (sin relacionar nombramiento)
- ✅ Actualizar detalle de legajo (mostrar nombramientos calculados)
- ✅ Nueva vista: Histórico mensual por persona

## Conclusión

Este rediseño corrige el problema fundamental del modelo actual y permite que el sistema refleje correctamente la realidad de la gestión presupuestaria universitaria, donde:

- Las asignaciones presupuestarias son plazas que pueden rotar entre personas
- Los datos mensuales son la clave para auditoría y control
- Los nombramientos se visualizan pero se calculan dinámicamente desde el histórico mensual
