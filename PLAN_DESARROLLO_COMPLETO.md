# 📋 Plan de Desarrollo Completo - Sistema de Legajos
## Frontend React + Backend NestJS

---

## 🎯 Visión General del Proyecto

**Sistema integral de gestión de legajos universitarios** con arquitectura moderna, escalable y profesional.

### Stack Tecnológico

**Frontend:**
- ⚛️ React 18
- ⚡ Vite
- 📘 TypeScript
- 🎨 Bootstrap 5 + React-Bootstrap
- 🔐 JWT Authentication
- 📡 Axios/TanStack Query
- 🎯 React Router DOM v6
- 📝 React Hook Form + Zod
- 🎭 React Icons

**Backend:**
- 🟢 NestJS
- 🗄️ PostgreSQL + Prisma
- 🔒 JWT + Passport
- 📚 Swagger/OpenAPI
- 🛡️ Helmet + CORS

---

## 📁 Fase 1: Estructura del Proyecto Frontend

### 1.1 Crear proyecto Vite con React + TypeScript

```bash
cd c:/projects/legajos
npm create vite@latest client -- --template react-ts
cd client
npm install
```

### 1.2 Instalar dependencias principales

```bash
# UI Framework
npm install bootstrap@5.3.2 react-bootstrap@2.10.0

# Routing
npm install react-router-dom@6.21.0

# State Management & API
npm install @tanstack/react-query@5.17.0 axios@1.6.5

# Forms & Validation
npm install react-hook-form@7.49.3 @hookform/resolvers zod@3.22.4

# Icons & Utilities
npm install react-icons lucide-react date-fns clsx

# Authentication
npm install jwt-decode@4.0.0

# Dev Dependencies
npm install -D @types/node
```

### 1.3 Estructura de carpetas optimizada

```
client/
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── src/
│   ├── @types/           # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── persona.types.ts
│   │   ├── legajo.types.ts
│   │   └── api.types.ts
│   │
│   ├── api/              # API service layer
│   │   ├── config/
│   │   │   ├── axios.config.ts
│   │   │   └── queryClient.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── personas.service.ts
│   │   │   ├── legajos.service.ts
│   │   │   └── documentos.service.ts
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── usePersonas.ts
│   │       └── useLegajos.ts
│   │
│   ├── assets/           # Imágenes, fonts, etc.
│   │   ├── images/
│   │   └── styles/
│   │       ├── variables.scss
│   │       └── custom.scss
│   │
│   ├── components/       # Componentes reutilizables
│   │   ├── common/       # Componentes genéricos
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   ├── Loader/
│   │   │   ├── Alert/
│   │   │   └── Pagination/
│   │   │
│   │   ├── forms/        # Componentes de formulario
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   └── FormFileUpload.tsx
│   │   │
│   │   └── layout/       # Componentes de layout
│   │       ├── Header/
│   │       │   ├── Header.tsx
│   │       │   ├── Navbar.tsx
│   │       │   └── UserMenu.tsx
│   │       ├── Sidebar/
│   │       │   ├── Sidebar.tsx
│   │       │   └── SidebarMenu.tsx
│   │       ├── Footer/
│   │       └── MainLayout.tsx
│   │
│   ├── context/          # React Context
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── guards/           # Route guards
│   │   ├── AuthGuard.tsx
│   │   └── RoleGuard.tsx
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePermissions.ts
│   │   └── useToast.ts
│   │
│   ├── pages/            # Páginas principales
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── components/
│   │   │       ├── StatsCard.tsx
│   │   │       ├── RecentActivity.tsx
│   │   │       └── QuickActions.tsx
│   │   │
│   │   ├── personas/
│   │   │   ├── PersonasList.tsx
│   │   │   ├── PersonaDetail.tsx
│   │   │   ├── PersonaForm.tsx
│   │   │   └── components/
│   │   │       ├── PersonaCard.tsx
│   │   │       ├── PersonaFilters.tsx
│   │   │       └── PersonaTable.tsx
│   │   │
│   │   ├── legajos/
│   │   │   ├── LegajosList.tsx
│   │   │   ├── LegajoDetail.tsx
│   │   │   ├── LegajoForm.tsx
│   │   │   └── components/
│   │   │       ├── LegajoHeader.tsx
│   │   │       ├── NombramientosTab.tsx
│   │   │       ├── DocumentosTab.tsx
│   │   │       └── HistorialTab.tsx
│   │   │
│   │   ├── nombramientos/
│   │   │   ├── NombramientosList.tsx
│   │   │   ├── NombramientoForm.tsx
│   │   │   └── components/
│   │   │
│   │   └── usuarios/
│   │       ├── UsuariosList.tsx
│   │       ├── UsuarioForm.tsx
│   │       └── UsuarioProfile.tsx
│   │
│   ├── routes/           # Configuración de rutas
│   │   ├── AppRoutes.tsx
│   │   ├── PrivateRoutes.tsx
│   │   └── PublicRoutes.tsx
│   │
│   ├── schemas/          # Zod schemas para validación
│   │   ├── auth.schema.ts
│   │   ├── persona.schema.ts
│   │   └── legajo.schema.ts
│   │
│   ├── utils/            # Utilidades
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 🎨 Fase 2: Diseño y UI Components

### 2.1 Sistema de diseño con Bootstrap personalizado

**`src/assets/styles/variables.scss`**
```scss
// Colores primarios (Universidad)
$primary: #1e3a8a;        // Azul universitario
$secondary: #64748b;       // Gris azulado
$success: #16a34a;
$danger: #dc2626;
$warning: #f59e0b;
$info: #0891b2;

// Colores de fondo
$body-bg: #f8fafc;
$sidebar-bg: #1e293b;
$card-bg: #ffffff;

// Tipografía
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-size-base: 0.875rem;
$headings-font-weight: 600;

// Espaciado
$spacer: 1rem;
$border-radius: 0.5rem;
$border-radius-lg: 0.75rem;

// Sombras
$box-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### 2.2 Componentes reutilizables clave

**Componentes prioritarios:**

1. **DataTable** - Tabla con paginación, ordenamiento, filtros
2. **SearchBar** - Búsqueda con debounce
3. **FormWizard** - Formularios multi-paso
4. **StatusBadge** - Badges de estado dinámicos
5. **ConfirmDialog** - Modal de confirmación
6. **EmptyState** - Estado vacío con ilustraciones
7. **LoadingOverlay** - Loading global
8. **Breadcrumbs** - Navegación de migas
9. **Tabs** - Pestañas reutilizables
10. **DateRangePicker** - Selector de fechas

---

## 🔐 Fase 3: Autenticación y Seguridad

### 3.1 Sistema de autenticación completo

**Flujo de autenticación:**

```typescript
// AuthContext con JWT
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  register: (data: RegisterDto) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}
```

**Características:**
- ✅ Login/Logout
- ✅ Registro de usuarios
- ✅ Token refresh automático
- ✅ Persistencia en localStorage
- ✅ Guards de rutas por rol
- ✅ Interceptor de axios para auth
- ✅ Manejo de sesión expirada

### 3.2 Roles y permisos

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  RRHH = 'RRHH',
  USUARIO = 'USUARIO',
}

const permissions = {
  ADMIN: ['*'],
  RRHH: ['legajos:read', 'legajos:write', 'personas:read', 'personas:write'],
  USUARIO: ['legajos:read', 'personas:read'],
};
```

---

## 📡 Fase 4: Integración con Backend API

### 4.1 Configuración de Axios

**`src/api/config/axios.config.ts`**
```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 4.2 React Query para cache y sincronización

**Configuración optimizada:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 4.3 Custom hooks por entidad

**Ejemplo: `usePersonas`**
```typescript
export const usePersonas = (params?: PersonaQueryParams) => {
  return useQuery({
    queryKey: ['personas', params],
    queryFn: () => personasService.getAll(params),
  });
};

export const usePersona = (id: string) => {
  return useQuery({
    queryKey: ['persona', id],
    queryFn: () => personasService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePersona = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: personasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['personas']);
    },
  });
};
```

---

## 📝 Fase 5: Formularios y Validación

### 5.1 React Hook Form + Zod

**Schema de validación:**
```typescript
// src/schemas/persona.schema.ts
export const personaSchema = z.object({
  numeroCedula: z.string()
    .min(1, 'Número de cédula requerido')
    .regex(/^\d+$/, 'Solo números'),
  nombres: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100),
  apellidos: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100),
  fechaNacimiento: z.date().optional(),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().optional(),
});

export type PersonaFormData = z.infer<typeof personaSchema>;
```

**Implementación en formulario:**
```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<PersonaFormData>({
  resolver: zodResolver(personaSchema),
});
```

### 5.2 Componentes de formulario reutilizables

- FormInput con validación visual
- FormSelect con búsqueda
- FormDatePicker
- FormFileUpload con preview
- FormCheckbox/Radio
- FormTextarea con contador

---

## 🎯 Fase 6: Páginas Principales

### 6.1 Dashboard (Página principal)

**Características:**
- 📊 Cards con estadísticas (Total personas, legajos activos, etc.)
- 📈 Gráficos (Legajos por facultad, nombramientos por tipo)
- 📋 Actividad reciente
- ⚡ Acciones rápidas
- 🔔 Notificaciones

### 6.2 Gestión de Personas

**Funcionalidades:**
- ✅ Lista paginada con búsqueda y filtros
- ✅ Vista de detalles con tabs
- ✅ Formulario crear/editar
- ✅ Exportar a Excel/PDF
- ✅ Importación masiva
- ✅ Historial de cambios

### 6.3 Gestión de Legajos

**Características:**
- ✅ Vista maestra-detalle
- ✅ Tabs: Datos básicos, Nombramientos, Documentos, Historial
- ✅ Timeline de eventos
- ✅ Upload de documentos con drag & drop
- ✅ Generación de reportes
- ✅ Estados del legajo con colores

### 6.4 Nombramientos

**Funcionalidades:**
- ✅ CRUD completo
- ✅ Asignación de cargos
- ✅ Gestión de asignaciones salariales
- ✅ Historial de cambios
- ✅ Validaciones de fechas

---

## 🎨 Fase 7: Layout y Navegación

### 7.1 Layout principal

**Estructura:**
```
┌─────────────────────────────────────┐
│           Header/Navbar              │
│  Logo | Search | Notifications | User│
├──────┬──────────────────────────────┤
│      │                              │
│ Side │      Content Area            │
│ bar  │                              │
│      │                              │
│ Menu │      (Pages)                 │
│      │                              │
│      │                              │
├──────┴──────────────────────────────┤
│            Footer                    │
└─────────────────────────────────────┘
```

### 7.2 Sidebar con menú colapsable

**Secciones:**
- 🏠 Dashboard
- 👥 Personas
- 📁 Legajos
- 📋 Nombramientos
- 📄 Documentos
- 👤 Usuarios (Admin)
- ⚙️ Configuración

---

## 🧪 Fase 8: Testing

### 8.1 Configuración de testing

```bash
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event vitest jsdom
```

### 8.2 Tests prioritarios

- ✅ Componentes comunes (Button, Input, Modal)
- ✅ Formularios (validaciones)
- ✅ AuthContext
- ✅ Hooks personalizados
- ✅ Servicios API

---

## 🚀 Fase 9: Optimización y Performance

### 9.1 Code splitting

```typescript
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const PersonasList = lazy(() => import('./pages/personas/PersonasList'));
```

### 9.2 Memoización

- useMemo para cálculos pesados
- useCallback para funciones
- React.memo para componentes

### 9.3 Optimización de bundle

- Tree shaking
- Dynamic imports
- Compresión de assets
- Lazy loading de imágenes

---

## 📦 Fase 10: Build y Deploy

### 10.1 Variables de entorno

**`.env.development`**
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Sistema de Legajos
VITE_UPLOAD_MAX_SIZE=5242880
```

**`.env.production`**
```env
VITE_API_URL=https://api.legajos.uni.edu.py/api/v1
VITE_APP_NAME=Sistema de Legajos - UNI
```

### 10.2 Build optimizado

```bash
npm run build
```

### 10.3 Deploy (opciones)

- **Vercel** (Recomendado para frontend)
- **Netlify**
- **Railway** (Backend + Frontend)
- **VPS** con Docker

---

## 🎯 Plan de Implementación (16 semanas)

### ✅ Sprint 1-2: Fundamentos (2 semanas)
- Configuración del proyecto
- Sistema de diseño y componentes base
- Autenticación completa
- Layout principal

### ✅ Sprint 3-4: Módulo Personas (2 semanas)
- Lista de personas
- Formulario crear/editar
- Vista de detalle
- Búsqueda y filtros

### ✅ Sprint 5-6: Módulo Legajos (2 semanas)
- Gestión de legajos
- Asociación con personas
- Estados y workflow
- Timeline de eventos

### ✅ Sprint 7-8: Módulo Nombramientos (2 semanas)
- CRUD de nombramientos
- Asignaciones salariales
- Validaciones complejas
- Reportes

### ✅ Sprint 9-10: Módulo Documentos (2 semanas)
- Upload de archivos
- Visualización de documentos
- Organización por categorías
- Búsqueda de documentos

### ✅ Sprint 11-12: Dashboard y Reportes (2 semanas)
- Dashboard interactivo
- Gráficos y estadísticas
- Generación de reportes
- Exportación de datos

### ✅ Sprint 13-14: Módulo Usuarios (2 semanas)
- Gestión de usuarios
- Roles y permisos
- Logs de auditoría
- Configuración del sistema

### ✅ Sprint 15-16: Testing y Deploy (2 semanas)
- Tests automatizados
- Optimización de performance
- Documentación
- Deploy a producción

---

## 🛠️ Mejores Prácticas Aplicadas

### ✅ Arquitectura
- Separación de concerns (API, UI, lógica)
- Componentes atómicos reutilizables
- Custom hooks para lógica compartida
- Context API para estado global

### ✅ Código Limpio
- TypeScript estricto
- ESLint + Prettier
- Nombres descriptivos
- Comentarios significativos
- DRY (Don't Repeat Yourself)

### ✅ Performance
- Lazy loading de rutas
- Memoización inteligente
- Optimización de re-renders
- Debounce en búsquedas
- Paginación en backend

### ✅ UX/UI
- Loading states
- Error boundaries
- Feedback visual
- Responsive design
- Accesibilidad (a11y)

### ✅ Seguridad
- Validación client + server
- Sanitización de inputs
- Token refresh automático
- HTTPS en producción
- CORS configurado

---

## 📚 Recursos y Documentación

### Documentación oficial:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Bootstrap](https://getbootstrap.com)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## 🎬 Próximos Pasos Inmediatos

1. **Crear proyecto Vite**
   ```bash
   cd c:/projects/legajos
   npm create vite@latest client -- --template react-ts
   ```

2. **Instalar dependencias**
   ```bash
   cd client
   npm install
   # Instalar todas las dependencias listadas en Fase 1.2
   ```

3. **Configurar estructura de carpetas**
   - Crear todas las carpetas según la estructura definida

4. **Configurar variables de entorno**
   - Crear archivos .env.development y .env.production

5. **Implementar componentes base**
   - Button, Input, Card, Modal
   - Layout principal
   - Sistema de routing

6. **Implementar autenticación**
   - AuthContext
   - Login/Register pages
   - Auth guards

---

## 💡 Notas Importantes

### ⚠️ Adaptación del Backend

Antes de empezar el frontend, necesitas:

1. **Adaptar módulos del backend** para usar los modelos reales:
   - `funcionarios` → usar `Persona` + `Legajo`
   - `dependencias` → usar `Facultad`

2. **Crear endpoints faltantes**:
   - `/api/v1/personas` (CRUD completo)
   - `/api/v1/legajos` (CRUD completo)
   - `/api/v1/nombramientos` (CRUD completo)
   - `/api/v1/documentos` (Upload + CRUD)
   - `/api/v1/facultades` (CRUD)

3. **Documentar API en Swagger**
   - Todos los endpoints deben estar documentados
   - Incluir ejemplos de request/response

### ✅ Ventajas de este plan

- 🎯 **Escalable**: Fácil agregar nuevos módulos
- 🔄 **Mantenible**: Código limpio y organizado
- ⚡ **Rápido**: Componentes reutilizables
- 🎨 **Profesional**: UI moderna con Bootstrap
- 🔒 **Seguro**: Autenticación y autorización robusta
- 📱 **Responsive**: Funciona en todos los dispositivos

---

**¿Quieres que empecemos con la implementación del frontend? 🚀**
