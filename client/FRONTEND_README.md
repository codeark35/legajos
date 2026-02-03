# Guía de Integración Frontend - Sistema de Legajos

## 🚀 URLs de Acceso

### Backend (API)
- **Local (WSL):** http://localhost:3020
- **Desde Windows:** http://172.29.51.161:3020
- **Documentación (Swagger):** http://172.29.51.161:3020/docs
- **Health Check:** http://172.29.51.161:3020/api/v1/health

### Frontend (React)
- **Local (WSL):** http://localhost:5173
- **Desde Windows:** http://172.29.51.161:5173

## 📦 Estructura del Frontend

```
client/src/
├── components/
│   └── Layout.tsx              # Layout principal con navbar y footer
├── contexts/
│   └── AuthContext.tsx         # Contexto de autenticación
├── hooks/
│   ├── usePersonas.ts          # Hooks para gestión de personas
│   ├── useLegajos.ts           # Hooks para gestión de legajos
│   └── useAsignacionesPresupuestarias.ts  # Hooks para asignaciones
├── pages/
│   ├── LoginPage.tsx           # Página de login
│   ├── DashboardPage.tsx       # Dashboard principal
│   ├── PersonasListPage.tsx    # Lista de personas
│   ├── LegajosListPage.tsx     # Lista de legajos
│   ├── AsignacionesListPage.tsx        # Lista de asignaciones
│   └── AsignacionDetailPage.tsx        # Detalle con histórico mensual
├── services/
│   ├── api.service.ts          # Cliente HTTP (Axios)
│   ├── auth.service.ts         # Servicio de autenticación
│   └── personas.service.ts     # Servicio de personas
└── types/
    └── index.ts                # Definiciones de tipos TypeScript
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
VITE_API_URL=http://172.29.51.161:3020/api/v1
```

## 🎯 Características Implementadas

### 1. **Sistema de Autenticación**
- Login con email y contraseña
- JWT almacenado en localStorage
- Interceptor automático de Axios para agregar token
- Redirección automática al expirar token
- Decorador `@CurrentUser()` para obtener usuario en endpoints

### 2. **TanStack Query (React Query)**
- Caché automática de datos
- Refetch inteligente
- Optimistic updates
- Invalidación de queries tras mutaciones

### 3. **Hooks Personalizados**

#### usePersonas
```typescript
const { data, isLoading, error } = usePersonas({ search, page, limit });
const createMutation = useCreatePersona();
const updateMutation = useUpdatePersona();
const deleteMutation = useDeletePersona();
```

#### useAsignacionesPresupuestarias
```typescript
const { data } = useAsignacion(id);
const { data: historico } = useHistoricoAnio(id, 2024);
const { data: auditoria } = useAuditoriaAsignacion(id);
const agregarMes = useAgregarMes();
const eliminarMes = useEliminarMes();
```

### 4. **Páginas Implementadas**

#### Dashboard
- Cards con acceso rápido a módulos
- Resumen de estadísticas
- Navegación visual

#### Lista de Personas
- Tabla paginada
- Búsqueda en tiempo real
- Acciones CRUD (Ver, Editar, Eliminar)
- Indicadores visuales

#### Lista de Legajos
- Paginación
- Filtros
- Estado visual (badges)
- Navegación a detalle

#### Asignaciones Presupuestarias
- Lista de asignaciones
- Acceso a histórico mensual
- Botón de auditoría

#### Detalle de Asignación (⭐ Funcionalidad Principal)
- **Tabla de 12 meses (Enero-Diciembre)**
- **Selector de año con navegación**
- **Agregar datos mensuales inline:**
  - Monto Total
  - Horas Extras
  - Bonificaciones
  - Descuentos
  - Observaciones
- **Eliminar mes con confirmación**
- **Visor de auditoría:**
  - Historial completo de cambios
  - Usuario que realizó el cambio
  - IP de origen
  - Valores antes/después
  - Timestamp

### 5. **Layout Consistente**
- Navbar con menú desplegable
- Links de navegación activos
- Footer con información del sistema
- Dropdown de usuario con:
  - Email del usuario
  - Rol del usuario
  - Botón de logout

### 6. **Estilos Personalizados**
- Efectos hover en cards
- Animaciones en botones
- Scrollbar personalizada
- Mejoras en tablas y forms
- Alertas con borde de color

## 🔐 Flujo de Autenticación

```typescript
// 1. Login
POST /auth/login
Body: { email, password }
Response: { access_token, user: { id, email, rol } }

// 2. Almacenamiento
localStorage.setItem('access_token', token);
localStorage.setItem('user', JSON.stringify(user));

// 3. Requests automáticos con token
headers: { Authorization: `Bearer ${token}` }

// 4. Logout
localStorage.removeItem('access_token');
localStorage.removeItem('user');
navigate('/login');
```

## 📊 Uso del Histórico Mensual

### Agregar Mes
```typescript
const agregarMes = useAgregarMes();

agregarMes.mutateAsync({
  id: asignacionId,
  anio: 2024,
  mes: 1,  // Enero
  datos: {
    montoTotal: 5000000,
    horasExtras: 10,
    bonificaciones: 500000,
    descuentos: 200000,
    observaciones: "Pago regular"
  }
});
```

### Consultar Mes
```typescript
const { data } = useHistoricoMes(id, 2024, 1);
// data: { montoTotal, horasExtras, bonificaciones, descuentos, observaciones }
```

### Consultar Año Completo
```typescript
const { data } = useHistoricoAnio(id, 2024);
// data: { 1: {...}, 2: {...}, ..., 12: {...} }
```

### Ver Auditoría
```typescript
const { data: auditoria } = useAuditoriaAsignacion(id);
// Array con historial de cambios:
// [
//   {
//     fechaModificacion: "2024-01-15T10:30:00Z",
//     usuarioModificacion: "user-uuid",
//     campoModificado: "historicoMensual.2024.01",
//     valorAnterior: "{...}",
//     valorNuevo: "{...}",
//     ipAddress: "192.168.1.100"
//   }
// ]
```

## 🎨 Componentes UI

### Tabla Responsive
```tsx
<div className="table-responsive">
  <table className="table table-hover">
    {/* ... */}
  </table>
</div>
```

### Paginación
```tsx
<nav>
  <ul className="pagination">
    <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
      <button onClick={() => setPage(page - 1)}>Anterior</button>
    </li>
    {/* ... */}
  </ul>
</nav>
```

### Badges de Estado
```tsx
<span className={`badge ${
  estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'
}`}>
  {estado}
</span>
```

## 🚀 Próximos Pasos

### En Desarrollo
- [ ] Formularios de creación/edición
- [ ] Validación con Zod + React Hook Form
- [ ] Toasts para notificaciones
- [ ] Modales para confirmaciones
- [ ] Exportación a Excel/PDF
- [ ] Gráficos con histórico presupuestario

### Módulos Pendientes
- [ ] Nombramientos
- [ ] Facultades
- [ ] Cargos
- [ ] Categorías Presupuestarias
- [ ] Líneas Presupuestarias
- [ ] Documentos (con upload de archivos)

## 🐛 Debugging

### Ver logs del backend
```bash
# Terminal del servidor
# Los logs aparecen automáticamente en la consola
```

### Ver requests en el navegador
1. Abrir DevTools (F12)
2. Ir a Network
3. Filtrar por XHR/Fetch
4. Ver request/response completos

### Verificar token JWT
```javascript
// En la consola del navegador
localStorage.getItem('access_token');
```

## 📝 Notas Importantes

1. **CORS:** Ya configurado en el backend para aceptar `http://localhost:5173`
2. **JWT:** Expira en 7 días (configurable en `JWT_EXPIRES_IN`)
3. **RBAC:** Algunos endpoints requieren roles específicos (ADMIN, RECURSOS_HUMANOS)
4. **IP Address:** Se captura automáticamente en el backend usando FastifyRequest
5. **Auditoría:** Se registra automáticamente en todas las modificaciones de histórico mensual

## 🎉 ¡Listo para Probar!

Abre http://172.29.51.161:5173 en tu navegador y comienza a probar:

1. **Login** (usa un usuario del seed o registra uno nuevo)
2. Navega a **Asignaciones**
3. Haz clic en el icono de **calendario** de cualquier asignación
4. **Agrega datos mensuales** haciendo clic en "Agregar"
5. **Ver auditoría** con el botón en la esquina superior derecha
6. **Navega entre años** con los botones de navegación

¡Disfruta del sistema! 🚀
