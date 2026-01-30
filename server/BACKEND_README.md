# Sistema de Legajos - Backend API

Backend escalable y de alto rendimiento para el sistema de gestión de legajos de funcionarios públicos, construido con NestJS, Prisma y PostgreSQL.

## 🚀 Características

### Arquitectura
- ✅ **Arquitectura modular** en capas (Controllers → Services → Repositories)
- ✅ **DTOs robustos** con validación automática
- ✅ **Interceptores globales** para logging y transformación de respuestas
- ✅ **Filtros de excepciones** personalizados
- ✅ **Guards** para autenticación JWT y autorización basada en roles
- ✅ **Paginación optimizada** con metadatos completos
- ✅ **Decoradores personalizados** para reducir código repetitivo

### Seguridad
- 🔒 Autenticación JWT con refresh tokens
- 🔒 Encriptación de contraseñas con bcrypt
- 🔒 Helmet para headers de seguridad
- 🔒 CORS configurado de forma segura
- 🔒 Rate limiting
- 🔒 Validación estricta de inputs

### Performance
- ⚡ Compresión gzip/brotli
- ⚡ Consultas optimizadas con Prisma
- ⚡ Índices en campos de búsqueda frecuente
- ⚡ Paginación eficiente
- ⚡ Caching de configuración
- ⚡ Lazy loading de relaciones

### Documentación
- 📚 Swagger/OpenAPI completo
- 📚 DTOs documentados
- 📚 Ejemplos de uso
- 📚 Tipos TypeScript

## 📁 Estructura del Proyecto

```
server/
├── src/
│   ├── common/                      # Utilidades compartidas
│   │   ├── decorators/              # Decoradores personalizados
│   │   │   ├── api-paginated-response.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/                     # DTOs comunes
│   │   │   ├── pagination.dto.ts
│   │   │   └── response.dto.ts
│   │   ├── filters/                 # Filtros de excepciones
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                  # Guards de autorización
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/            # Interceptores
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── interfaces/              # Interfaces TypeScript
│   │   │   └── paginated-response.interface.ts
│   │   └── utils/                   # Funciones utilitarias
│   │       └── pagination.util.ts
│   │
│   ├── modules/                     # Módulos de negocio
│   │   ├── auth/                    # Autenticación
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── funcionarios/            # Gestión de funcionarios
│   │   │   ├── dto/
│   │   │   ├── funcionarios.controller.ts
│   │   │   ├── funcionarios.service.ts
│   │   │   └── funcionarios.module.ts
│   │   │
│   │   └── dependencias/            # Gestión de dependencias
│   │       ├── dto/
│   │       ├── dependencias.controller.ts
│   │       ├── dependencias.service.ts
│   │       └── dependencias.module.ts
│   │
│   ├── prisma/                      # Prisma ORM
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── app.module.ts                # Módulo principal
│   └── main.ts                      # Punto de entrada
│
├── prisma/
│   ├── schema.prisma                # Schema de base de datos
│   └── seed.ts                      # Datos iniciales
│
├── test/                            # Tests E2E
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Instalación

### Prerequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar e instalar dependencias

```bash
cd server
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/legajos_db"
JWT_SECRET="tu-secret-key-muy-seguro"
```

### 3. Configurar base de datos

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear las tablas
npm run prisma:migrate

# Cargar datos de ejemplo
npm run prisma:seed
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📖 API Endpoints

### Autenticación

```http
POST   /api/v1/auth/register       # Registrar usuario
POST   /api/v1/auth/login          # Iniciar sesión
GET    /api/v1/auth/profile        # Obtener perfil (requiere JWT)
```

### Funcionarios

```http
GET    /api/v1/funcionarios                           # Listar con paginación
GET    /api/v1/funcionarios/search                    # Búsqueda avanzada
GET    /api/v1/funcionarios/estadisticas              # Estadísticas
GET    /api/v1/funcionarios/:id                       # Obtener por ID
GET    /api/v1/funcionarios/documento/:tipo/:numero   # Buscar por documento
POST   /api/v1/funcionarios                           # Crear (requiere rol ADMIN/RRHH)
PATCH  /api/v1/funcionarios/:id                       # Actualizar (requiere rol ADMIN/RRHH)
DELETE /api/v1/funcionarios/:id                       # Desactivar (requiere rol ADMIN)
```

### Dependencias

```http
GET    /api/v1/dependencias            # Listar con paginación
GET    /api/v1/dependencias/jerarquia  # Obtener jerarquía completa
GET    /api/v1/dependencias/:id        # Obtener por ID
POST   /api/v1/dependencias            # Crear (requiere rol ADMIN)
PATCH  /api/v1/dependencias/:id        # Actualizar (requiere rol ADMIN)
DELETE /api/v1/dependencias/:id        # Desactivar (requiere rol ADMIN)
```

## 🔐 Autenticación

El sistema usa JWT para autenticación. Para acceder a endpoints protegidos:

1. Hacer login y obtener el token:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legajos.com","password":"password123"}'
```

2. Usar el token en requests:
```bash
curl http://localhost:3000/api/v1/funcionarios \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Paginación

Todos los endpoints de listado soportan paginación:

```bash
GET /api/v1/funcionarios?page=1&limit=10&sortBy=apellido&sortOrder=asc
```

Parámetros:
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 10, max: 100)
- `sortBy`: Campo para ordenar
- `sortOrder`: Orden ('asc' o 'desc')

Respuesta:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🔍 Búsqueda Avanzada

Ejemplo de búsqueda de funcionarios:

```bash
GET /api/v1/funcionarios/search?nombre=Juan&estado=ACTIVO&fechaIngresoDesde=2020-01-01
```

## 📚 Documentación Interactiva

Swagger UI disponible en: `http://localhost:3000/api/docs`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Docker

```bash
docker-compose up -d
```

### Variables de Producción

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-production-secret-min-32-chars"
CLIENT_URL="https://your-frontend-domain.com"
```

## 📈 Performance Tips

1. **Índices de Base de Datos**: Ya configurados en el schema de Prisma
2. **Paginación**: Siempre usar paginación para grandes datasets
3. **Select Específico**: Usar `select` en Prisma para traer solo campos necesarios
4. **Eager Loading**: Usar `include` solo cuando se necesite
5. **Caching**: Considerar Redis para datos frecuentemente consultados

## 🔧 Scripts Disponibles

```bash
npm run build              # Compilar TypeScript
npm run start              # Iniciar en producción
npm run start:dev          # Desarrollo con hot-reload
npm run start:debug        # Debug mode
npm run lint               # Linter
npm run format             # Formatear código
npm run prisma:generate    # Generar Prisma Client
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:seed        # Cargar datos de ejemplo
```

## 🛡️ Seguridad

### Headers de Seguridad (Helmet)
- X-DNS-Prefetch-Control
- X-Frame-Options
- Strict-Transport-Security
- X-Content-Type-Options
- X-XSS-Protection

### Validación
- Validación automática de DTOs con class-validator
- Sanitización de inputs
- Prevención de SQL injection (Prisma)
- Rate limiting configurado

## 📝 Roles y Permisos

- **ADMIN**: Acceso total al sistema
- **RRHH**: Gestión de funcionarios y recursos humanos
- **USUARIO**: Acceso de solo lectura

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT

## 📞 Soporte

Para problemas o consultas, abrir un issue en el repositorio.

---

Desarrollado con ❤️ para la gestión eficiente de legajos
