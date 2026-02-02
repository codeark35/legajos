# 🔄 PLAN DE REESTRUCTURACIÓN DE BASE DE DATOS
## Sistema de Legajos UNI + Gestión Presupuestaria Mensual

**Universidad Nacional de Itapúa**  
**Fecha**: 2 de febrero de 2026  
**Base de datos**: PostgreSQL 14+  
**ORM**: Prisma

---

## 📊 ANÁLISIS DE LA SITUACIÓN ACTUAL

### Sistema Actual de Legajos (Diagrama Existente)
```
✅ Fortalezas:
- Estructura bien normalizada para personas y legajos
- Sistema de auditoría completo (HistorialCambio)
- Gestión documental con OCR
- Relaciones bien definidas
- UUIDs como identificadores

⚠️ Limitaciones Identificadas:
- AsignacionSalarial muy simple (solo monto y fechas)
- NO tiene histórico mensual de devengamientos
- Difícil seguimiento mes a mes de presupuesto vs devengado
- No registra aportes jubilatorios por período
- Escalabilidad limitada (300,000+ registros en enfoque tradicional)
```

### Sistema Propuesto (HTML Files)
```
✅ Ventajas:
- Histórico completo en JSONB (~1,000 registros vs 300,000+)
- Búsquedas ultra-rápidas con índices GIN
- Edición mensual simplificada
- Un solo registro por funcionario/asignación
- Escalable a 25+ años de datos

🎯 Enfoque Híbrido:
- Mantener estructura relacional para datos maestros
- JSONB para histórico mensual (presupuesto, devengado, aportes)
- Mejor de ambos mundos
```

---

## 🎯 ESTRATEGIA DE INTEGRACIÓN

### Principios de Diseño

1. **Preservar la estructura relacional existente** para datos maestros
2. **Agregar JSONB para histórico mensual** en tabla de asignaciones
3. **Mantener auditoría completa** en todas las operaciones
4. **Optimizar para consultas frecuentes** (reportes mensuales)
5. **Garantizar integridad referencial** con foreign keys

---

## 📋 FASE 1: ANÁLISIS DE TABLAS A MODIFICAR

### 1.1 Tablas que SE MANTIENEN (Sin cambios)

| Tabla | Justificación |
|-------|---------------|
| **Persona** | Estructura adecuada, solo datos básicos |
| **Legajo** | Core del sistema, bien diseñado |
| **Documento** | Sistema documental completo |
| **DocumentoPagina** | Funciona correctamente |
| **Facultad** | Catálogo estable |
| **Cargo** | Catálogo estable |
| **Resolucion** | Respaldo legal necesario |
| **Usuario** | Control de acceso OK |
| **HistorialCambio** | Auditoría completa |

### 1.2 Tablas que SE MODIFICARÁN

#### A) **Nombramiento** → Renombrar campos + agregar relaciones

**Cambios propuestos:**
```sql
-- Campo ANTES:
salarioMensual DECIMAL

-- Campos DESPUÉS:
salarioBase DECIMAL          -- Salario base del nombramiento
moneda VARCHAR(3)             -- PYG, USD, etc.
vigente BOOLEAN               -- Si el nombramiento está activo
```

**Nuevos índices:**
```sql
CREATE INDEX idx_nombramiento_vigente ON Nombramiento(vigente, fechaInicio);
CREATE INDEX idx_nombramiento_persona ON Nombramiento(legajoId, vigente);
```

#### B) **AsignacionSalarial** → TRANSFORMACIÓN COMPLETA

**ANTES** (Estructura actual - limitada):
```sql
CREATE TABLE AsignacionSalarial (
    id UUID PRIMARY KEY,
    nombramientoId UUID FK,
    categoriaPresupuestariaId UUID FK,
    monto DECIMAL,
    fechaDesde DATE,
    fechaHasta DATE,
    -- Problema: No hay histórico mensual detallado
);
```

**DESPUÉS** (Nueva estructura híbrida):
```sql
CREATE TABLE AsignacionPresupuestaria (
    id UUID PRIMARY KEY,
    nombramientoId UUID FK,
    categoriaPresupuestariaId UUID FK,
    lineaPresupuestariaId UUID FK,       -- NUEVO: Referencia a línea
    objetoGasto VARCHAR(20),              -- NUEVO: Código de objeto de gasto
    
    -- Datos base de la asignación
    salarioBase DECIMAL NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PYG',
    
    -- HISTÓRICO MENSUAL EN JSONB (¡Clave del sistema!)
    historicoMensual JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Auditoría
    fechaCreacion TIMESTAMP DEFAULT NOW(),
    fechaUltimaActualizacion TIMESTAMP DEFAULT NOW(),
    usuarioUltimaActualizacion VARCHAR(100),
    
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    -- Constraint: Un nombramiento solo tiene una asignación activa
    CONSTRAINT uk_nombramiento_unico UNIQUE (nombramientoId)
);

-- Índices críticos
CREATE INDEX idx_asig_nombramiento ON AsignacionPresupuestaria(nombramientoId);
CREATE INDEX idx_asig_categoria ON AsignacionPresupuestaria(categoriaPresupuestariaId);
CREATE INDEX idx_asig_linea ON AsignacionPresupuestaria(lineaPresupuestariaId);

-- Índice GIN para búsquedas JSON ultra-rápidas
CREATE INDEX idx_asig_historico_gin ON AsignacionPresupuestaria 
USING GIN (historicoMensual);
```

**Estructura del campo JSONB `historicoMensual`:**
```json
{
  "2024": {
    "01": {
      "presupuestado": 3021000,
      "devengado": 3021000,
      "aporte_jubilatorio": 604200,
      "aporte_ips": 150000,
      "otros_descuentos": 0,
      "neto_cobrado": 2266800,
      "fecha_registro": "2024-02-05",
      "usuario_registro": "admin",
      "observaciones": "",
      "estado": "CERRADO"
    },
    "02": {
      "presupuestado": 3021000,
      "devengado": 3021000,
      "aporte_jubilatorio": 604200,
      "aporte_ips": 150000,
      "otros_descuentos": 0,
      "neto_cobrado": 2266800,
      "fecha_registro": "2024-03-03",
      "usuario_registro": "admin",
      "observaciones": "",
      "estado": "CERRADO"
    }
    // ... hasta mes 12
  },
  "2025": {
    "01": {
      "presupuestado": 3150000,
      "devengado": 3150000,
      "aporte_jubilatorio": 630000,
      "aporte_ips": 157500,
      "otros_descuentos": 0,
      "neto_cobrado": 2362500,
      "fecha_registro": "2025-02-01",
      "usuario_registro": "rrhh_maria",
      "observaciones": "Aumento salarial por nueva escala",
      "estado": "CERRADO"
    },
    "02": {
      "presupuestado": 3150000,
      "devengado": 3150000,
      "aporte_jubilatorio": 630000,
      "aporte_ips": 157500,
      "otros_descuentos": 0,
      "neto_cobrado": 2362500,
      "fecha_registro": "2025-03-05",
      "usuario_registro": "rrhh_maria",
      "observaciones": "",
      "estado": "ABIERTO"
    }
    // Meses siguientes se agregan mes a mes
  }
}
```

### 1.3 Tablas NUEVAS a Crear

#### C) **LineaPresupuestaria** (NUEVA)

```sql
CREATE TABLE LineaPresupuestaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigoLinea VARCHAR(10) UNIQUE NOT NULL,    -- Ej: "100", "200", "300"
    descripcion TEXT,
    tipo VARCHAR(50),                           -- "DOCENTE", "ADMINISTRATIVO", etc.
    vigente BOOLEAN DEFAULT true,
    
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_linea_codigo ON LineaPresupuestaria(codigoLinea);
CREATE INDEX idx_linea_vigente ON LineaPresupuestaria(vigente);

-- Datos semilla
INSERT INTO LineaPresupuestaria (codigoLinea, descripcion, tipo) VALUES
('100', 'Personal Permanente', 'DOCENTE'),
('200', 'Personal Contratado', 'ADMINISTRATIVO'),
('300', 'Personal Jornal', 'TECNICO');
```

#### D) **DependenciaAcademica** (NUEVA - complementa Facultad)

```sql
CREATE TABLE DependenciaAcademica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facultadId UUID REFERENCES Facultad(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    tipo VARCHAR(50),                           -- "CARRERA", "DEPARTAMENTO", "CATEDRA"
    descripcion TEXT,
    
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_dep_facultad ON DependenciaAcademica(facultadId);
CREATE INDEX idx_dep_codigo ON DependenciaAcademica(codigo);
```

---

## 🔄 FASE 2: MIGRACIÓN DE DATOS PASO A PASO

### Paso 2.1: Crear Nuevas Tablas

```sql
-- Script: 001_crear_lineas_presupuestarias.sql
BEGIN;

CREATE TABLE LineaPresupuestaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigoLinea VARCHAR(10) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    vigente BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_linea_codigo ON LineaPresupuestaria(codigoLinea);
CREATE INDEX idx_linea_vigente ON LineaPresupuestaria(vigente);

-- Insertar líneas comunes
INSERT INTO LineaPresupuestaria (codigoLinea, descripcion, tipo) VALUES
('100', 'Personal Permanente Docente', 'DOCENTE'),
('200', 'Personal Contratado', 'ADMINISTRATIVO'),
('300', 'Personal Jornal', 'TECNICO'),
('400', 'Personal Eventual', 'OTRO');

COMMIT;
```

### Paso 2.2: Modificar CategoriaPresupuestaria

```sql
-- Script: 002_mejorar_categorias.sql
BEGIN;

-- Agregar columnas faltantes
ALTER TABLE CategoriaPresupuestaria 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50);

ALTER TABLE CategoriaPresupuestaria 
ADD COLUMN IF NOT EXISTS escalaSalarial VARCHAR(20);

-- Actualizar categorías existentes con nuevos datos
UPDATE CategoriaPresupuestaria 
SET tipo = 'DOCENTE', escalaSalarial = 'UNIVERSITARIA'
WHERE codigoCategoria IN ('L33', 'L23', 'L11');

UPDATE CategoriaPresupuestaria 
SET tipo = 'ADMINISTRATIVO', escalaSalarial = 'ADMINISTRATIVA'
WHERE codigoCategoria IN ('UU5', 'B06');

COMMIT;
```

### Paso 2.3: Crear Nueva Tabla AsignacionPresupuestaria

```sql
-- Script: 003_crear_asignacion_presupuestaria.sql
BEGIN;

CREATE TABLE AsignacionPresupuestaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombramientoId UUID REFERENCES Nombramiento(id) ON DELETE CASCADE,
    categoriaPresupuestariaId UUID REFERENCES CategoriaPresupuestaria(id),
    lineaPresupuestariaId UUID REFERENCES LineaPresupuestaria(id),
    objetoGasto VARCHAR(20),
    
    -- Datos base
    salarioBase DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PYG',
    
    -- JSONB para histórico mensual
    historicoMensual JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Auditoría
    fechaCreacion TIMESTAMP DEFAULT NOW(),
    fechaUltimaActualizacion TIMESTAMP DEFAULT NOW(),
    usuarioUltimaActualizacion VARCHAR(100),
    
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT uk_nombramiento_unico UNIQUE (nombramientoId)
);

-- Índices críticos
CREATE INDEX idx_asig_pres_nombramiento ON AsignacionPresupuestaria(nombramientoId);
CREATE INDEX idx_asig_pres_categoria ON AsignacionPresupuestaria(categoriaPresupuestariaId);
CREATE INDEX idx_asig_pres_linea ON AsignacionPresupuestaria(lineaPresupuestariaId);
CREATE INDEX idx_asig_pres_historico_gin ON AsignacionPresupuestaria 
USING GIN (historicoMensual);

COMMIT;
```

### Paso 2.4: Migrar Datos de AsignacionSalarial → AsignacionPresupuestaria

```sql
-- Script: 004_migrar_asignaciones_salariales.sql
BEGIN;

-- Migrar asignaciones existentes
INSERT INTO AsignacionPresupuestaria (
    nombramientoId,
    categoriaPresupuestariaId,
    lineaPresupuestariaId,
    objetoGasto,
    salarioBase,
    moneda,
    historicoMensual,
    fechaCreacion,
    usuarioUltimaActualizacion
)
SELECT 
    a.nombramientoId,
    a.categoriaPresupuestariaId,
    -- Asignar línea por defecto basado en tipo de nombramiento
    (SELECT id FROM LineaPresupuestaria WHERE codigoLinea = '100' LIMIT 1),
    '111', -- Objeto de gasto por defecto
    a.monto,
    a.moneda,
    -- Crear estructura JSON inicial vacía
    '{}'::jsonb,
    a.createdAt,
    'sistema_migracion'
FROM AsignacionSalarial a;

-- Verificar migración
SELECT COUNT(*) as total_migrados FROM AsignacionPresupuestaria;

COMMIT;
```

### Paso 2.5: Popular Histórico Mensual (Si hay datos históricos)

```sql
-- Script: 005_popular_historico_inicial.sql
-- Solo ejecutar si hay datos mensuales en otra tabla o sistema

BEGIN;

-- Ejemplo: Si tienes datos en tabla temporal DevengadosMensuales
-- UPDATE AsignacionPresupuestaria ap
-- SET historicoMensual = jsonb_set(
--     historicoMensual,
--     '{' || dm.anio || ',' || dm.mes || '}',
--     jsonb_build_object(
--         'presupuestado', dm.presupuestado,
--         'devengado', dm.devengado,
--         'aporte_jubilatorio', dm.aporte_jubilatorio,
--         'fecha_registro', dm.fecha_registro,
--         'usuario_registro', 'migracion_historica',
--         'observaciones', ''
--     )
-- )
-- FROM DevengadosMensuales dm
-- WHERE dm.nombramientoId = ap.nombramientoId;

COMMIT;
```

---

## 🛠️ FASE 3: FUNCIONES Y PROCEDIMIENTOS ALMACENADOS

### 3.1 Función: Agregar Mes a Funcionario

```sql
-- Script: 006_funciones_historico_mensual.sql

CREATE OR REPLACE FUNCTION agregar_mes_asignacion(
    p_nombramiento_id UUID,
    p_anio VARCHAR(4),
    p_mes VARCHAR(2),
    p_presupuestado NUMERIC,
    p_devengado NUMERIC,
    p_aporte_jubilatorio NUMERIC,
    p_aporte_ips NUMERIC DEFAULT 0,
    p_otros_descuentos NUMERIC DEFAULT 0,
    p_usuario VARCHAR(100) DEFAULT 'sistema',
    p_observaciones TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_neto_cobrado NUMERIC;
    v_nuevo_mes JSONB;
    v_resultado JSONB;
BEGIN
    -- Calcular neto cobrado
    v_neto_cobrado := p_devengado - p_aporte_jubilatorio - p_aporte_ips - p_otros_descuentos;
    
    -- Construir objeto JSON del mes
    v_nuevo_mes := jsonb_build_object(
        'presupuestado', p_presupuestado,
        'devengado', p_devengado,
        'aporte_jubilatorio', p_aporte_jubilatorio,
        'aporte_ips', p_aporte_ips,
        'otros_descuentos', p_otros_descuentos,
        'neto_cobrado', v_neto_cobrado,
        'fecha_registro', CURRENT_DATE,
        'usuario_registro', p_usuario,
        'observaciones', p_observaciones,
        'estado', 'ABIERTO'
    );
    
    -- Actualizar histórico mensual
    UPDATE AsignacionPresupuestaria
    SET 
        historicoMensual = jsonb_set(
            COALESCE(historicoMensual, '{}'::jsonb),
            ARRAY[p_anio, p_mes],
            v_nuevo_mes
        ),
        fechaUltimaActualizacion = NOW(),
        usuarioUltimaActualizacion = p_usuario,
        updatedAt = NOW()
    WHERE nombramientoId = p_nombramiento_id;
    
    -- Verificar si se actualizó
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe asignación para el nombramiento %', p_nombramiento_id;
    END IF;
    
    -- Registrar en auditoría
    INSERT INTO HistorialCambio (
        tablaAfectada,
        idRegistroAfectado,
        campoModificado,
        valorAnterior,
        valorNuevo,
        usuarioModificacion,
        fechaModificacion,
        motivo
    ) VALUES (
        'AsignacionPresupuestaria',
        p_nombramiento_id::text,
        'historicoMensual.' || p_anio || '.' || p_mes,
        NULL,
        v_nuevo_mes::text,
        p_usuario,
        NOW(),
        'Agregado mes ' || p_mes || '/' || p_anio
    );
    
    -- Retornar confirmación
    v_resultado := jsonb_build_object(
        'success', true,
        'mensaje', 'Mes agregado correctamente',
        'anio', p_anio,
        'mes', p_mes,
        'neto_cobrado', v_neto_cobrado
    );
    
    RETURN v_resultado;
END;
$$;
```

### 3.2 Función: Editar Mes Existente

```sql
CREATE OR REPLACE FUNCTION editar_mes_asignacion(
    p_nombramiento_id UUID,
    p_anio VARCHAR(4),
    p_mes VARCHAR(2),
    p_campo VARCHAR(50),
    p_nuevo_valor NUMERIC,
    p_usuario VARCHAR(100) DEFAULT 'sistema'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_mes_actual JSONB;
    v_valor_anterior TEXT;
    v_mes_actualizado JSONB;
BEGIN
    -- Obtener mes actual
    SELECT historicoMensual -> p_anio -> p_mes
    INTO v_mes_actual
    FROM AsignacionPresupuestaria
    WHERE nombramientoId = p_nombramiento_id;
    
    IF v_mes_actual IS NULL THEN
        RAISE EXCEPTION 'No existe el mes %/% para este nombramiento', p_mes, p_anio;
    END IF;
    
    -- Guardar valor anterior
    v_valor_anterior := v_mes_actual ->> p_campo;
    
    -- Actualizar campo específico
    v_mes_actualizado := jsonb_set(
        v_mes_actual,
        ARRAY[p_campo],
        to_jsonb(p_nuevo_valor)
    );
    
    -- Si se modifica devengado/descuentos, recalcular neto
    IF p_campo IN ('devengado', 'aporte_jubilatorio', 'aporte_ips', 'otros_descuentos') THEN
        v_mes_actualizado := jsonb_set(
            v_mes_actualizado,
            '{neto_cobrado}',
            to_jsonb(
                (v_mes_actualizado->>'devengado')::numeric - 
                (v_mes_actualizado->>'aporte_jubilatorio')::numeric -
                COALESCE((v_mes_actualizado->>'aporte_ips')::numeric, 0) -
                COALESCE((v_mes_actualizado->>'otros_descuentos')::numeric, 0)
            )
        );
    END IF;
    
    -- Guardar cambios
    UPDATE AsignacionPresupuestaria
    SET 
        historicoMensual = jsonb_set(
            historicoMensual,
            ARRAY[p_anio, p_mes],
            v_mes_actualizado
        ),
        fechaUltimaActualizacion = NOW(),
        usuarioUltimaActualizacion = p_usuario,
        updatedAt = NOW()
    WHERE nombramientoId = p_nombramiento_id;
    
    -- Auditoría
    INSERT INTO HistorialCambio (
        tablaAfectada,
        idRegistroAfectado,
        campoModificado,
        valorAnterior,
        valorNuevo,
        usuarioModificacion,
        fechaModificacion,
        motivo
    ) VALUES (
        'AsignacionPresupuestaria',
        p_nombramiento_id::text,
        'historicoMensual.' || p_anio || '.' || p_mes || '.' || p_campo,
        v_valor_anterior,
        p_nuevo_valor::text,
        p_usuario,
        NOW(),
        'Edición de ' || p_campo || ' del mes ' || p_mes || '/' || p_anio
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'mensaje', 'Campo actualizado correctamente',
        'valor_anterior', v_valor_anterior,
        'valor_nuevo', p_nuevo_valor
    );
END;
$$;
```

### 3.3 Función: Obtener Histórico Completo

```sql
CREATE OR REPLACE FUNCTION obtener_historico_funcionario(
    p_ci VARCHAR(20)
)
RETURNS TABLE (
    funcionario TEXT,
    cargo TEXT,
    dependencia TEXT,
    anio VARCHAR(4),
    mes VARCHAR(2),
    presupuestado NUMERIC,
    devengado NUMERIC,
    aporte_jubilatorio NUMERIC,
    neto_cobrado NUMERIC,
    fecha_registro DATE,
    usuario_registro VARCHAR(100),
    observaciones TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (p.apellidos || ' ' || p.nombres)::TEXT as funcionario,
        c.nombreCargo::TEXT as cargo,
        f.nombreFacultad::TEXT as dependencia,
        anio_key::VARCHAR(4) as anio,
        mes_key::VARCHAR(2) as mes,
        (mes_value->>'presupuestado')::NUMERIC as presupuestado,
        (mes_value->>'devengado')::NUMERIC as devengado,
        (mes_value->>'aporte_jubilatorio')::NUMERIC as aporte_jubilatorio,
        (mes_value->>'neto_cobrado')::NUMERIC as neto_cobrado,
        (mes_value->>'fecha_registro')::DATE as fecha_registro,
        (mes_value->>'usuario_registro')::VARCHAR(100) as usuario_registro,
        (mes_value->>'observaciones')::TEXT as observaciones
    FROM Persona p
    JOIN Legajo l ON p.id = l.personaId
    JOIN Nombramiento n ON l.id = n.legajoId
    JOIN AsignacionPresupuestaria ap ON n.id = ap.nombramientoId
    JOIN Cargo c ON n.cargoId = c.id
    JOIN Facultad f ON l.facultadId = f.id,
    LATERAL jsonb_each(ap.historicoMensual) AS anio_entry(anio_key, anio_value),
    LATERAL jsonb_each(anio_value) AS mes_entry(mes_key, mes_value)
    WHERE p.numeroCedula = p_ci
    ORDER BY anio_key DESC, mes_key DESC;
END;
$$;
```

---

## 📊 FASE 4: VISTAS MATERIALIZADAS PARA REPORTES

### 4.1 Vista: Devengamientos Mensuales Detallados

```sql
-- Script: 007_vista_materializada_devengamientos.sql

CREATE MATERIALIZED VIEW mv_devengamientos_mensuales AS
SELECT 
    -- Identificación
    p.id as persona_id,
    p.numeroCedula as ci,
    p.apellidos,
    p.nombres,
    p.apellidos || ' ' || p.nombres as nombre_completo,
    
    -- Organización
    f.nombreFacultad as dependencia,
    c.nombreCargo as cargo,
    
    -- Categoría presupuestaria
    cp.codigoCategoria as categoria,
    cp.descripcion as descripcion_categoria,
    lp.codigoLinea as linea,
    ap.objetoGasto as objeto_gasto,
    
    -- Período
    anio.key as anio,
    mes.key as mes,
    
    -- Valores monetarios
    (mes.value->>'presupuestado')::NUMERIC as presupuestado,
    (mes.value->>'devengado')::NUMERIC as devengado,
    (mes.value->>'aporte_jubilatorio')::NUMERIC as aporte_jubilatorio,
    (mes.value->>'aporte_ips')::NUMERIC as aporte_ips,
    (mes.value->>'otros_descuentos')::NUMERIC as otros_descuentos,
    (mes.value->>'neto_cobrado')::NUMERIC as neto_cobrado,
    
    -- Metadata
    (mes.value->>'fecha_registro')::DATE as fecha_registro,
    mes.value->>'usuario_registro' as usuario_registro,
    mes.value->>'observaciones' as observaciones,
    mes.value->>'estado' as estado,
    
    -- Timestamp de generación
    NOW() as fecha_actualizacion_vista
FROM Persona p
JOIN Legajo l ON p.id = l.personaId
JOIN Nombramiento n ON l.id = n.legajoId
JOIN AsignacionPresupuestaria ap ON n.id = ap.nombramientoId
JOIN Cargo c ON n.cargoId = c.id
JOIN Facultad f ON l.facultadId = f.id
JOIN CategoriaPresupuestaria cp ON ap.categoriaPresupuestariaId = cp.id
LEFT JOIN LineaPresupuestaria lp ON ap.lineaPresupuestariaId = lp.id,
LATERAL jsonb_each(ap.historicoMensual) as anio,
LATERAL jsonb_each(anio.value) as mes
WHERE n.estadoNombramiento IN ('VIGENTE', 'FINALIZADO');

-- Índices en vista materializada
CREATE INDEX idx_mv_dev_ci ON mv_devengamientos_mensuales(ci);
CREATE INDEX idx_mv_dev_periodo ON mv_devengamientos_mensuales(anio, mes);
CREATE INDEX idx_mv_dev_dependencia ON mv_devengamientos_mensuales(dependencia);
CREATE INDEX idx_mv_dev_categoria ON mv_devengamientos_mensuales(categoria);
CREATE INDEX idx_mv_dev_estado ON mv_devengamientos_mensuales(estado);

-- Refrescar vista (ejecutar después de cambios importantes o programado)
-- REFRESH MATERIALIZED VIEW mv_devengamientos_mensuales;
```

### 4.2 Vista: Resumen Anual por Funcionario

```sql
CREATE MATERIALIZED VIEW mv_resumen_anual_funcionarios AS
SELECT 
    p.id as persona_id,
    p.numeroCedula as ci,
    p.apellidos || ' ' || p.nombres as nombre_completo,
    f.nombreFacultad as dependencia,
    anio.key as anio,
    
    -- Totales del año
    SUM((mes.value->>'presupuestado')::NUMERIC) as total_presupuestado,
    SUM((mes.value->>'devengado')::NUMERIC) as total_devengado,
    SUM((mes.value->>'aporte_jubilatorio')::NUMERIC) as total_jubilatorio,
    SUM((mes.value->>'neto_cobrado')::NUMERIC) as total_neto,
    
    -- Estadísticas
    COUNT(*) as meses_trabajados,
    AVG((mes.value->>'devengado')::NUMERIC) as promedio_mensual,
    MAX((mes.value->>'devengado')::NUMERIC) as maximo_mensual,
    MIN((mes.value->>'devengado')::NUMERIC) as minimo_mensual,
    
    NOW() as fecha_actualizacion
FROM Persona p
JOIN Legajo l ON p.id = l.personaId
JOIN Nombramiento n ON l.id = n.legajoId
JOIN AsignacionPresupuestaria ap ON n.id = ap.nombramientoId
JOIN Facultad f ON l.facultadId = f.id,
LATERAL jsonb_each(ap.historicoMensual) as anio,
LATERAL jsonb_each(anio.value) as mes
GROUP BY p.id, p.numeroCedula, p.apellidos, p.nombres, f.nombreFacultad, anio.key;

-- Índices
CREATE INDEX idx_mv_resumen_ci ON mv_resumen_anual_funcionarios(ci);
CREATE INDEX idx_mv_resumen_anio ON mv_resumen_anual_funcionarios(anio);
CREATE INDEX idx_mv_resumen_dep ON mv_resumen_anual_funcionarios(dependencia);
```

---

## ⚡ FASE 5: TRIGGERS PARA AUDITORÍA AUTOMÁTICA

### 5.1 Trigger: Auditar Cambios en Histórico Mensual

```sql
-- Script: 008_triggers_auditoria.sql

CREATE OR REPLACE FUNCTION trigger_auditar_historico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cambio_detectado BOOLEAN := FALSE;
BEGIN
    -- Detectar si cambió historicoMensual
    IF (TG_OP = 'UPDATE' AND OLD.historicoMensual IS DISTINCT FROM NEW.historicoMensual) 
       OR TG_OP = 'INSERT' THEN
        
        INSERT INTO HistorialCambio (
            tablaAfectada,
            idRegistroAfectado,
            campoModificado,
            valorAnterior,
            valorNuevo,
            usuarioModificacion,
            fechaModificacion,
            motivo
        ) VALUES (
            'AsignacionPresupuestaria',
            NEW.id::text,
            'historicoMensual',
            CASE WHEN TG_OP = 'UPDATE' THEN OLD.historicoMensual::text ELSE NULL END,
            NEW.historicoMensual::text,
            COALESCE(NEW.usuarioUltimaActualizacion, current_user),
            NOW(),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Creación de asignación'
                ELSE 'Actualización de histórico mensual'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auditar_asignacion_presupuestaria
AFTER INSERT OR UPDATE ON AsignacionPresupuestaria
FOR EACH ROW
EXECUTE FUNCTION trigger_auditar_historico();
```

### 5.2 Trigger: Actualizar Timestamp Automáticamente

```sql
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updatedAt = NOW();
    NEW.fechaUltimaActualizacion = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_timestamp_asignacion
BEFORE UPDATE ON AsignacionPresupuestaria
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();
```

---

## 🔍 FASE 6: CONSULTAS ESENCIALES

### 6.1 Consulta: Funcionarios con Saldo Pendiente

```sql
-- Ver funcionarios que tienen diferencia entre presupuestado y devengado
SELECT 
    ci,
    nombre_completo,
    dependencia,
    anio,
    mes,
    presupuestado,
    devengado,
    (presupuestado - devengado) as diferencia
FROM mv_devengamientos_mensuales
WHERE presupuestado != devengado
ORDER BY anio DESC, mes DESC, diferencia DESC;
```

### 6.2 Consulta: Reporte Mensual por Dependencia

```sql
-- Reporte consolidado de una dependencia específica en un mes
SELECT 
    dependencia,
    COUNT(DISTINCT ci) as total_funcionarios,
    SUM(presupuestado) as total_presupuestado,
    SUM(devengado) as total_devengado,
    SUM(aporte_jubilatorio) as total_aportes,
    SUM(neto_cobrado) as total_neto_pagado
FROM mv_devengamientos_mensuales
WHERE anio = '2026' 
  AND mes = '02'
  AND dependencia = 'Facultad de Ciencias y Tecnología'
GROUP BY dependencia;
```

### 6.3 Consulta: Histórico Completo de un Funcionario

```sql
-- Ver todo el histórico de un funcionario por su CI
SELECT * FROM obtener_historico_funcionario('430295')
ORDER BY anio DESC, mes DESC;
```

### 6.4 Consulta: Agregar Nuevo Mes (Marzo 2026)

```sql
-- Agregar devengado del mes de marzo 2026
SELECT agregar_mes_asignacion(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,  -- ID del nombramiento
    '2026',                                         -- Año
    '03',                                           -- Mes
    3200000,                                        -- Presupuestado
    3200000,                                        -- Devengado
    640000,                                         -- Aporte jubilatorio (20%)
    160000,                                         -- Aporte IPS (5%)
    0,                                              -- Otros descuentos
    'admin',                                        -- Usuario
    'Normal'                                        -- Observaciones
);
```

### 6.5 Consulta: Editar Mes Existente

```sql
-- Corregir el devengado de enero 2026
SELECT editar_mes_asignacion(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,  -- ID del nombramiento
    '2026',                                         -- Año
    '01',                                           -- Mes
    'devengado',                                    -- Campo a editar
    3250000,                                        -- Nuevo valor
    'admin'                                         -- Usuario
);
```

---

## 🎯 FASE 7: ESQUEMA PRISMA ACTUALIZADO

### 7.1 Schema Prisma Completo

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// ENTIDADES PRINCIPALES (SIN CAMBIOS)
// ============================================================

model Persona {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  numeroCedula    String   @unique @db.VarChar(20)
  nombres         String   @db.VarChar(100)
  apellidos       String   @db.VarChar(100)
  fechaNacimiento DateTime @db.Date
  direccion       String?  @db.Text
  telefono        String?  @db.VarChar(20)
  email           String?  @db.VarChar(100)
  estado          PersonaEstado @default(ACTIVO)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  legajos         Legajo[]

  @@index([numeroCedula])
  @@index([apellidos, nombres])
}

model Legajo {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  numeroLegajo    String   @unique @db.VarChar(50)
  personaId       String   @db.Uuid
  tipoLegajo      TipoLegajo
  facultadId      String   @db.Uuid
  fechaApertura   DateTime @db.Date
  estadoLegajo    EstadoLegajo @default(ACTIVO)
  observaciones   String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  persona         Persona     @relation(fields: [personaId], references: [id], onDelete: Cascade)
  facultad        Facultad    @relation(fields: [facultadId], references: [id])
  nombramientos   Nombramiento[]
  documentos      Documento[]

  @@index([personaId])
  @@index([numeroLegajo])
  @@index([estadoLegajo])
}

model Nombramiento {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  legajoId            String   @db.Uuid
  cargoId             String   @db.Uuid
  tipoNombramiento    String   @db.VarChar(100)
  categoria           String?  @db.VarChar(50)
  fechaInicio         DateTime @db.Date
  fechaFin            DateTime? @db.Date
  resolucionNumero    String?  @db.VarChar(50)
  resolucionFecha     DateTime? @db.Date
  resolucionId        String?  @db.Uuid
  salarioBase         Decimal  @db.Decimal(12,2)
  moneda              String   @default("PYG") @db.VarChar(3)
  estadoNombramiento  EstadoNombramiento @default(VIGENTE)
  vigente             Boolean  @default(true)
  observaciones       String?  @db.Text
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  legajo              Legajo      @relation(fields: [legajoId], references: [id], onDelete: Cascade)
  cargo               Cargo       @relation(fields: [cargoId], references: [id])
  resolucion          Resolucion? @relation(fields: [resolucionId], references: [id])
  asignacionPresupuestaria AsignacionPresupuestaria?

  @@index([legajoId])
  @@index([fechaInicio, fechaFin])
  @@index([estadoNombramiento])
  @@index([vigente, fechaInicio])
}

// ============================================================
// GESTIÓN PRESUPUESTARIA (NUEVA ESTRUCTURA)
// ============================================================

model AsignacionPresupuestaria {
  id                          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nombramientoId              String   @unique @db.Uuid
  categoriaPresupuestariaId   String   @db.Uuid
  lineaPresupuestariaId       String?  @db.Uuid
  objetoGasto                 String?  @db.VarChar(20)
  
  // Datos base
  salarioBase                 Decimal  @db.Decimal(12,2)
  moneda                      String   @default("PYG") @db.VarChar(3)
  
  // HISTÓRICO MENSUAL EN JSONB (estructura clave)
  historicoMensual            Json     @default("{}")
  
  // Auditoría
  fechaCreacion               DateTime @default(now())
  fechaUltimaActualizacion    DateTime @default(now())
  usuarioUltimaActualizacion  String?  @db.VarChar(100)
  
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  nombramiento                Nombramiento             @relation(fields: [nombramientoId], references: [id], onDelete: Cascade)
  categoriaPresupuestaria     CategoriaPresupuestaria  @relation(fields: [categoriaPresupuestariaId], references: [id])
  lineaPresupuestaria         LineaPresupuestaria?     @relation(fields: [lineaPresupuestariaId], references: [id])

  @@index([nombramientoId])
  @@index([categoriaPresupuestariaId])
  @@index([lineaPresupuestariaId])
  @@map("asignaciones_presupuestarias")
}

model LineaPresupuestaria {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  codigoLinea     String   @unique @db.VarChar(10)
  descripcion     String?  @db.Text
  tipo            String?  @db.VarChar(50)
  vigente         Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  asignaciones    AsignacionPresupuestaria[]

  @@index([codigoLinea])
  @@index([vigente])
  @@map("lineas_presupuestarias")
}

model CategoriaPresupuestaria {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  codigoCategoria     String   @unique @db.VarChar(10)
  descripcion         String?  @db.Text
  rangoSalarialMin    Decimal? @db.Decimal(12,2)
  rangoSalarialMax    Decimal? @db.Decimal(12,2)
  tipo                String?  @db.VarChar(50)
  escalaSalarial      String?  @db.VarChar(20)
  vigente             Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  asignaciones        AsignacionPresupuestaria[]

  @@map("categorias_presupuestarias")
}

// ============================================================
// ESTRUCTURA ORGANIZACIONAL (SIN CAMBIOS)
// ============================================================

model Cargo {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nombreCargo       String   @db.VarChar(200)
  descripcion       String?  @db.Text
  nivelJerarquico   Int?
  departamentoArea  String?  @db.VarChar(100)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  nombramientos     Nombramiento[]
}

model Facultad {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nombreFacultad  String   @db.VarChar(200)
  codigo          String   @unique @db.VarChar(20)
  tipo            TipoFacultad
  descripcion     String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  legajos         Legajo[]
  dependencias    DependenciaAcademica[]
}

model DependenciaAcademica {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facultadId  String   @db.Uuid
  nombre      String   @db.VarChar(200)
  codigo      String?  @unique @db.VarChar(20)
  tipo        String?  @db.VarChar(50)
  descripcion String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  facultad    Facultad @relation(fields: [facultadId], references: [id], onDelete: Cascade)

  @@index([facultadId])
  @@map("dependencias_academicas")
}

// ============================================================
// GESTIÓN DOCUMENTAL (SIN CAMBIOS)
// ============================================================

model Documento {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  legajoId            String   @db.Uuid
  tipoDocumento       TipoDocumento
  nombreArchivo       String   @db.VarChar(255)
  rutaArchivo         String   @db.Text
  extension           String   @db.VarChar(10)
  tamanioBytes        BigInt
  numeroPaginaOriginal Int?
  fechaDocumento      DateTime? @db.Date
  fechaCarga          DateTime @default(now())
  descripcion         String?  @db.Text
  tags                String[]
  procesadoOCR        Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  legajo              Legajo   @relation(fields: [legajoId], references: [id], onDelete: Cascade)
  paginas             DocumentoPagina[]

  @@index([legajoId])
  @@index([tipoDocumento])
  @@index([fechaDocumento])
}

model DocumentoPagina {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  documentoId     String   @db.Uuid
  numeroPagina    Int
  rutaImagen      String   @db.Text
  textoExtraidoOCR String? @db.Text
  procesado       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  documento       Documento @relation(fields: [documentoId], references: [id], onDelete: Cascade)

  @@index([documentoId])
  @@map("documentos_paginas")
}

// ============================================================
// RESOLUCIONES Y AUDITORÍA (SIN CAMBIOS)
// ============================================================

model Resolucion {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  numeroResolucion    String   @unique @db.VarChar(50)
  fechaResolucion     DateTime @db.Date
  tipoResolucion      String   @db.VarChar(100)
  descripcion         String?  @db.Text
  autoridadFirmante   String?  @db.VarChar(200)
  archivoAdjunto      String?  @db.Text
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  nombramientos       Nombramiento[]
}

model HistorialCambio {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tablaAfectada       String   @db.VarChar(100)
  idRegistroAfectado  String   @db.VarChar(100)
  campoModificado     String   @db.VarChar(100)
  valorAnterior       String?  @db.Text
  valorNuevo          String?  @db.Text
  usuarioModificacion String   @db.VarChar(100)
  fechaModificacion   DateTime @default(now())
  motivo              String?  @db.Text
  ipAddress           String?  @db.VarChar(50)

  @@index([tablaAfectada, idRegistroAfectado])
  @@index([fechaModificacion])
  @@index([usuarioModificacion])
  @@map("historial_cambios")
}

// ============================================================
// USUARIOS Y SEGURIDAD (SIN CAMBIOS)
// ============================================================

model Usuario {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String   @unique @db.VarChar(100)
  nombreUsuario String   @db.VarChar(100)
  passwordHash  String   @db.Text
  rol           RolUsuario
  activo        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  ultimoAcceso  DateTime?

  @@index([email])
}

// ============================================================
// ENUMS
// ============================================================

enum PersonaEstado {
  ACTIVO
  INACTIVO
  SUSPENDIDO
}

enum TipoLegajo {
  DOCENTE
  ADMINISTRATIVO
  TECNICO
  DIRECTIVO
  OTRO
}

enum EstadoLegajo {
  ACTIVO
  CERRADO
  SUSPENDIDO
  ARCHIVADO
}

enum EstadoNombramiento {
  VIGENTE
  FINALIZADO
  SUSPENDIDO
  CANCELADO
}

enum TipoFacultad {
  FACULTAD
  DEPARTAMENTO
  CENTRO
  INSTITUTO
  DIRECCION
}

enum TipoDocumento {
  NOMBRAMIENTO
  RESOLUCION
  CERTIFICADO
  CONTRATO
  ACTA
  MEMORANDUM
  NOTA
  CURRICULUM
  TITULO
  CEDULA
  OTRO
}

enum RolUsuario {
  ADMIN
  RECURSOS_HUMANOS
  CONSULTA
  USUARIO
}
```

---

## 📊 FASE 8: PLAN DE EJECUCIÓN Y ROLLBACK

### 8.1 Orden de Ejecución de Scripts

```bash
# 1. Crear nuevas tablas base
psql -U postgres -d legajos_uni < 001_crear_lineas_presupuestarias.sql

# 2. Mejorar categorías existentes
psql -U postgres -d legajos_uni < 002_mejorar_categorias.sql

# 3. Crear tabla principal AsignacionPresupuestaria
psql -U postgres -d legajos_uni < 003_crear_asignacion_presupuestaria.sql

# 4. Migrar datos existentes
psql -U postgres -d legajos_uni < 004_migrar_asignaciones_salariales.sql

# 5. Popular histórico (si corresponde)
psql -U postgres -d legajos_uni < 005_popular_historico_inicial.sql

# 6. Crear funciones
psql -U postgres -d legajos_uni < 006_funciones_historico_mensual.sql

# 7. Crear vistas materializadas
psql -U postgres -d legajos_uni < 007_vista_materializada_devengamientos.sql

# 8. Crear triggers
psql -U postgres -d legajos_uni < 008_triggers_auditoria.sql

# 9. Verificar integridad
psql -U postgres -d legajos_uni < 009_verificar_integridad.sql
```

### 8.2 Script de Verificación

```sql
-- Script: 009_verificar_integridad.sql

DO $$
DECLARE
    v_count_lineas INT;
    v_count_asignaciones INT;
    v_count_vistas INT;
BEGIN
    -- Verificar tablas creadas
    SELECT COUNT(*) INTO v_count_lineas FROM LineaPresupuestaria;
    SELECT COUNT(*) INTO v_count_asignaciones FROM AsignacionPresupuestaria;
    
    RAISE NOTICE 'Líneas presupuestarias creadas: %', v_count_lineas;
    RAISE NOTICE 'Asignaciones migradas: %', v_count_asignaciones;
    
    -- Verificar vistas materializadas
    SELECT COUNT(*) INTO v_count_vistas 
    FROM pg_matviews 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Vistas materializadas creadas: %', v_count_vistas;
    
    -- Verificar funciones
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'agregar_mes_asignacion'
    ) THEN
        RAISE NOTICE '✓ Función agregar_mes_asignacion creada correctamente';
    ELSE
        RAISE WARNING '✗ Función agregar_mes_asignacion NO encontrada';
    END IF;
    
    -- Verificar triggers
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_auditar_asignacion_presupuestaria'
    ) THEN
        RAISE NOTICE '✓ Trigger de auditoría creado correctamente';
    ELSE
        RAISE WARNING '✗ Trigger de auditoría NO encontrado';
    END IF;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Verificación completada';
    RAISE NOTICE '==============================================';
END $$;
```

### 8.3 Plan de Rollback

```sql
-- Script: ROLLBACK_completo.sql
-- ⚠️ EJECUTAR SOLO SI ES NECESARIO REVERTIR TODOS LOS CAMBIOS

BEGIN;

-- 1. Eliminar triggers
DROP TRIGGER IF EXISTS trg_auditar_asignacion_presupuestaria ON AsignacionPresupuestaria;
DROP TRIGGER IF EXISTS trg_update_timestamp_asignacion ON AsignacionPresupuestaria;

-- 2. Eliminar funciones
DROP FUNCTION IF EXISTS agregar_mes_asignacion;
DROP FUNCTION IF EXISTS editar_mes_asignacion;
DROP FUNCTION IF EXISTS obtener_historico_funcionario;
DROP FUNCTION IF EXISTS trigger_auditar_historico;
DROP FUNCTION IF EXISTS trigger_update_timestamp;

-- 3. Eliminar vistas materializadas
DROP MATERIALIZED VIEW IF EXISTS mv_devengamientos_mensuales;
DROP MATERIALIZED VIEW IF EXISTS mv_resumen_anual_funcionarios;

-- 4. Eliminar tabla principal
DROP TABLE IF EXISTS AsignacionPresupuestaria CASCADE;

-- 5. Eliminar tablas auxiliares
DROP TABLE IF EXISTS DependenciaAcademica CASCADE;
DROP TABLE IF EXISTS LineaPresupuestaria CASCADE;

-- 6. Revertir cambios en CategoriaPresupuestaria
ALTER TABLE CategoriaPresupuestaria DROP COLUMN IF EXISTS tipo;
ALTER TABLE CategoriaPresupuestaria DROP COLUMN IF EXISTS escalaSalarial;

COMMIT;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'ROLLBACK COMPLETADO';
    RAISE NOTICE 'Sistema revertido al estado anterior';
    RAISE NOTICE '==============================================';
END $$;
```

---

## 🚀 FASE 9: TAREAS POST-MIGRACIÓN

### 9.1 Optimización de PostgreSQL

```sql
-- Configuraciones recomendadas en postgresql.conf

shared_buffers = 4GB                    # 25% de RAM
effective_cache_size = 12GB             # 75% de RAM
maintenance_work_mem = 1GB
work_mem = 50MB
random_page_cost = 1.1                  # Para SSD
effective_io_concurrency = 200          # Para SSD

# Autovacuum
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

### 9.2 Mantenimiento Programado

```sql
-- Crear job para refrescar vistas materializadas
-- (Usar pg_cron o cron del sistema operativo)

-- Refrescar vistas cada noche a las 2 AM
-- 0 2 * * * psql -U postgres -d legajos_uni -c "REFRESH MATERIALIZED VIEW mv_devengamientos_mensuales;"

-- VACUUM semanal
-- 0 3 * * 0 psql -U postgres -d legajos_uni -c "VACUUM ANALYZE AsignacionPresupuestaria;"
```

### 9.3 Monitoreo de Rendimiento

```sql
-- Verificar tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar índices más usados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Verificar queries lentos
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 📈 RESULTADOS ESPERADOS

### Métricas de Rendimiento

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Registros totales** | ~300,000 | ~1,000 | 99.7% reducción |
| **Espacio en disco** | ~5 GB | ~50 MB | 99% reducción |
| **Tiempo de búsqueda** | 500ms | <10ms | 98% mejora |
| **Tiempo de backup** | 15 min | <1 min | 93% mejora |
| **Complejidad de consultas** | Alta | Media | Simplificadas |

### Beneficios Operativos

✅ **Escalabilidad**: Soporta 25+ años de datos sin degradación  
✅ **Mantenibilidad**: Código más limpio y funciones reutilizables  
✅ **Auditoría completa**: Triggers automáticos + HistorialCambio  
✅ **Flexibilidad**: Agregar campos al JSON sin ALTER TABLE  
✅ **Rendimiento**: Índices GIN + vistas materializadas  

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Pérdida de datos en migración | Baja | Alto | Backup completo antes de migrar |
| JSON muy grande (>1MB) | Media | Medio | Monitorear tamaño, alertar si supera límite |
| Consultas JSON lentas | Baja | Medio | Índices GIN + vistas materializadas |
| Incompatibilidad Prisma | Baja | Alto | Probar schema en ambiente dev primero |
| Trigger causa deadlock | Muy Baja | Alto | Manejo de errores en triggers |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-Migración
- [ ] Backup completo de base de datos actual
- [ ] Exportar esquema actual para comparación
- [ ] Crear ambiente de pruebas idéntico a producción
- [ ] Revisar y aprobar todos los scripts SQL
- [ ] Coordinar ventana de mantenimiento

### Durante Migración
- [ ] Ejecutar scripts en orden correcto (001 → 009)
- [ ] Verificar cada paso antes de continuar
- [ ] Ejecutar script de verificación (009)
- [ ] Probar funciones principales
- [ ] Validar integridad referencial

### Post-Migración
- [ ] Refrescar vistas materializadas
- [ ] Ejecutar VACUUM ANALYZE completo
- [ ] Actualizar estadísticas de Postgres
- [ ] Probar queries críticos
- [ ] Monitorear rendimiento primeras 48 horas
- [ ] Documentar cualquier ajuste realizado
- [ ] Capacitar equipo en nuevas funciones

---

## 📞 CONTACTO Y SOPORTE

**Equipo de Desarrollo**  
Universidad Nacional de Itapúa  
Departamento de Tecnología

**Documentación adicional:**
- Diagrama ER actualizado: [Incluir en el proyecto]
- Manual de usuario: [Por crear]
- Guía de troubleshooting: [Por crear]

---

**Última actualización**: 2 de febrero de 2026  
**Versión del plan**: 1.0  
**Estado**: Listo para revisión
