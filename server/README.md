# Sistema de Gestión de Legajos - Universidad Nacional de Itapúa

Sistema completo para la gestión de legajos del personal universitario, desarrollado con Prisma ORM y PostgreSQL.

## 📋 Características

- ✅ Gestión completa de personas y legajos
- ✅ Control de nombramientos y asignaciones salariales
- ✅ Múltiples categorías presupuestarias
- ✅ Gestión de documentos multipágina con soporte OCR
- ✅ Historial completo de cambios (auditoría)
- ✅ Soporte para facultades y dependencias
- ✅ Sistema de resoluciones
- ✅ Control de usuarios con roles

## 🏗️ Estructura de la Base de Datos

### Modelos principales:

1. **Persona** - Datos personales del funcionario
2. **Legajo** - Expediente del funcionario
3. **Nombramiento** - Cargos y períodos de trabajo
4. **AsignacionSalarial** - Detalles de salarios por período
5. **Documento** - Archivos asociados al legajo
6. **DocumentoPagina** - Páginas individuales de documentos multipágina
7. **CategoriaPresupuestaria** - Categorías salariales (L33, UU5, B06, etc.)
8. **Facultad** - Facultades y dependencias
9. **Cargo** - Catálogo de cargos
10. **Resolucion** - Resoluciones oficiales
11. **HistorialCambio** - Auditoría de cambios
12. **Usuario** - Usuarios del sistema

## 🚀 Instalación

### 1. Prerequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 2. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd sistema-legajos-unae
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar la base de datos

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/legajos_db?schema=public"
```

### 5. Ejecutar migraciones y seed

Opción A - Script automático:
```bash
npm run setup
```

Opción B - Paso a paso:
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas
npm run db:migrate

# Cargar datos de ejemplo
npm run db:seed
```

### 6. Abrir Prisma Studio

```bash
npm run db:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás ver y editar los datos.

## 📊 Scripts disponibles

```bash
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Compilar TypeScript
npm run start            # Ejecutar en producción
npm run db:generate      # Generar cliente de Prisma
npm run db:migrate       # Crear/actualizar migraciones
npm run db:seed          # Cargar datos de ejemplo
npm run db:studio        # Abrir Prisma Studio
npm run db:push          # Sincronizar schema (desarrollo)
npm run db:reset         # Resetear base de datos
```

## 💡 Ejemplos de Uso

### Crear una persona y su legajo

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearPersonaConLegajo() {
  const persona = await prisma.persona.create({
    data: {
      numeroCedula: '1.234.567',
      nombres: 'Juan Carlos',
      apellidos: 'González Pérez',
      fechaNacimiento: new Date('1980-05-15'),
      email: 'jgonzalez@unae.edu.py',
      telefono: '0971-123456',
      estado: 'ACTIVO',
      legajos: {
        create: {
          numeroLegajo: 'LEG-2026-001',
          tipoLegajo: 'DOCENTE',
          facultadId: 'id-de-facultad',
          estadoLegajo: 'ACTIVO',
        },
      },
    },
    include: {
      legajos: true,
    },
  });

  return persona;
}
```

### Crear un nombramiento con asignación salarial

```typescript
async function crearNombramiento() {
  const nombramiento = await prisma.nombramiento.create({
    data: {
      legajoId: 'id-del-legajo',
      cargoId: 'id-del-cargo',
      tipoNombramiento: 'Docente Técnico',
      categoria: 'L33',
      fechaInicio: new Date('2026-01-01'),
      salarioMensual: 3001000,
      moneda: 'PYG',
      estadoNombramiento: 'VIGENTE',
      asignacionesSalariales: {
        create: {
          categoriaPresupuestaria: 'L33',
          monto: 3001000,
          moneda: 'PYG',
          fechaDesde: new Date('2026-01-01'),
          descripcion: 'Salario inicial como Docente Técnico',
        },
      },
    },
    include: {
      asignacionesSalariales: true,
    },
  });

  return nombramiento;
}
```

### Consultar legajo completo con historial

```typescript
async function obtenerLegajoCompleto(numeroLegajo: string) {
  const legajo = await prisma.legajo.findUnique({
    where: { numeroLegajo },
    include: {
      persona: true,
      facultad: true,
      nombramientos: {
        include: {
          cargo: true,
          asignacionesSalariales: {
            include: {
              categoriaPresupuestariaObj: true,
            },
          },
        },
        orderBy: { fechaInicio: 'desc' },
      },
      documentos: {
        include: {
          paginas: true,
        },
      },
    },
  });

  return legajo;
}
```

### Buscar personas por cédula

```typescript
async function buscarPorCedula(cedula: string) {
  const persona = await prisma.persona.findUnique({
    where: { numeroCedula: cedula },
    include: {
      legajos: {
        include: {
          nombramientos: {
            where: { estadoNombramiento: 'VIGENTE' },
          },
        },
      },
    },
  });

  return persona;
}
```

### Obtener nombramientos vigentes

```typescript
async function obtenerNombramientosVigentes() {
  const nombramientos = await prisma.nombramiento.findMany({
    where: {
      estadoNombramiento: 'VIGENTE',
      fechaFin: {
        gte: new Date(), // Fecha fin mayor o igual a hoy
      },
    },
    include: {
      legajo: {
        include: {
          persona: true,
          facultad: true,
        },
      },
      cargo: true,
      asignacionesSalariales: {
        where: {
          fechaHasta: {
            gte: new Date(),
          },
        },
      },
    },
  });

  return nombramientos;
}
```

### Registrar cambio en historial

```typescript
async function registrarCambio(
  tabla: string,
  registroId: string,
  campo: string,
  valorAnterior: string,
  valorNuevo: string,
  usuarioEmail: string,
  motivo?: string
) {
  const cambio = await prisma.historialCambio.create({
    data: {
      tablaAfectada: tabla,
      idRegistroAfectado: registroId,
      campoModificado: campo,
      valorAnterior,
      valorNuevo,
      usuarioModificacion: usuarioEmail,
      motivo,
      ipAddress: '127.0.0.1', // Obtener IP real en producción
    },
  });

  return cambio;
}
```

### Cargar documento con páginas

```typescript
async function cargarDocumento(legajoId: string) {
  const documento = await prisma.documento.create({
    data: {
      legajoId,
      tipoDocumento: 'NOMBRAMIENTO',
      nombreArchivo: 'nombramiento-2026.pdf',
      rutaArchivo: '/uploads/documentos/nombramiento-2026.pdf',
      extension: 'pdf',
      tamanioBytes: 1024000,
      fechaDocumento: new Date('2026-01-15'),
      descripcion: 'Resolución de nombramiento 2026',
      tags: ['nombramiento', '2026', 'docente'],
      paginas: {
        create: [
          {
            numeroPagina: 1,
            rutaImagen: '/uploads/paginas/doc-1-page-1.jpg',
            procesado: false,
          },
          {
            numeroPagina: 2,
            rutaImagen: '/uploads/paginas/doc-1-page-2.jpg',
            procesado: false,
          },
        ],
      },
    },
    include: {
      paginas: true,
    },
  });

  return documento;
}
```

## 🔍 Consultas Avanzadas

### Reporte de salarios por facultad

```typescript
async function reporteSalariosPorFacultad() {
  const reporte = await prisma.facultad.findMany({
    include: {
      legajos: {
        include: {
          nombramientos: {
            where: { estadoNombramiento: 'VIGENTE' },
            include: {
              asignacionesSalariales: {
                where: {
                  fechaHasta: {
                    gte: new Date(),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Calcular totales por facultad
  const totales = reporte.map((facultad) => {
    const totalSalarios = facultad.legajos.reduce((sum, legajo) => {
      const salarioLegajo = legajo.nombramientos.reduce((nomSum, nom) => {
        const salarioNom = nom.asignacionesSalariales.reduce(
          (asigSum, asig) => asigSum + Number(asig.monto),
          0
        );
        return nomSum + salarioNom;
      }, 0);
      return sum + salarioLegajo;
    }, 0);

    return {
      facultad: facultad.nombreFacultad,
      cantidadEmpleados: facultad.legajos.length,
      totalSalarios,
    };
  });

  return totales;
}
```

### Historial completo de un empleado

```typescript
async function historialEmpleado(numeroCedula: string) {
  const persona = await prisma.persona.findUnique({
    where: { numeroCedula },
    include: {
      legajos: {
        include: {
          nombramientos: {
            include: {
              cargo: true,
              asignacionesSalariales: true,
              resolucion: true,
            },
            orderBy: { fechaInicio: 'asc' },
          },
        },
      },
    },
  });

  return persona;
}
```

## 📁 Estructura del Proyecto

```
sistema-legajos-unae/
├── prisma/
│   ├── schema.prisma      # Schema de la base de datos
│   └── seed.ts            # Datos de ejemplo
├── src/
│   └── index.ts           # Punto de entrada (por crear)
├── .env                   # Variables de entorno (no incluir en git)
├── .env.example           # Ejemplo de variables
├── package.json           # Dependencias y scripts
├── setup-db.sh            # Script de configuración
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Este archivo
```

## 🔒 Seguridad

- Las contraseñas deben hashearse con bcrypt antes de guardar
- Implementar JWT para autenticación
- Validar todos los inputs
- Usar roles para control de acceso
- Sanitizar datos antes de consultas
- Implementar rate limiting en APIs

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Importantes

### Categorías Presupuestarias
Las categorías incluidas en el seed son:
- **L33**: Docente Técnico (Gs. 2.500.000 - 3.500.000)
- **UU5**: Director de Carrera (Gs. 3.500.000 - 4.500.000)
- **L23**: Encargado de Cátedra (Gs. 1.000.000 - 1.500.000)
- **B06**: Auxiliar de Enseñanza (Gs. 200.000 - 400.000)
- **L11**: Encargado de Cátedra (Gs. 600.000 - 900.000)
- **L06**: Profesor de Macroeconomía (Gs. 400.000 - 700.000)

### Consideraciones de Performance
- Usar índices en campos de búsqueda frecuente
- Implementar paginación en listados grandes
- Considerar caché para consultas frecuentes
- Usar `select` y `include` selectivamente

### Migraciones
- Siempre revisar las migraciones antes de aplicar en producción
- Mantener backups antes de cambios importantes
- Usar `prisma migrate deploy` en producción, no `migrate dev`

## 📞 Soporte

Para problemas o consultas:
- Abrir un issue en el repositorio
- Contactar al equipo de desarrollo de la universidad

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles

---

Desarrollado con ❤️ para la Universidad Nacional de Itapúa
