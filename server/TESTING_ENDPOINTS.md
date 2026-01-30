# 🧪 Guía de Testing de Endpoints
## Sistema de Legajos - API REST

**Base URL:** `http://localhost:3020/api/v1`  
**Swagger UI:** `http://localhost:3020/api/docs`

---

## 🔐 Autenticación

### 1. Login (Obtener JWT)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@unae.edu.py",
  "password": "Admin123!"
}
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nombreUsuario": "admin",
    "email": "admin@unae.edu.py",
    "rol": "ADMIN"
  }
}
```

**Guardar el `access_token` para usar en los siguientes requests como:**
```
Authorization: Bearer <access_token>
```

---

## 👤 Personas

### Listar personas
```http
GET /api/v1/personas?page=1&limit=10
Authorization: Bearer <token>
```

### Buscar por cédula
```http
GET /api/v1/personas/cedula/1234567
Authorization: Bearer <token>
```

### Crear persona
```http
POST /api/v1/personas
Authorization: Bearer <token>
Content-Type: application/json

{
  "numeroCedula": "2345678",
  "nombres": "Juan Carlos",
  "apellidos": "González Pérez",
  "fechaNacimiento": "1985-03-15",
  "email": "juan.gonzalez@example.com",
  "telefono": "0981234567",
  "direccion": "Calle Principal 123"
}
```

---

## 📁 Legajos

### Crear legajo
```http
POST /api/v1/legajos
Authorization: Bearer <token>
Content-Type: application/json

{
  "personaId": "<id-de-persona>",
  "tipoLegajo": "DOCENTE",
  "facultadId": "<id-de-facultad>",
  "fechaApertura": "2024-01-15",
  "observaciones": "Legajo de docente titular"
}
```

**Nota:** El número de legajo se genera automáticamente: `LEG-2026-0001`

### Listar legajos
```http
GET /api/v1/legajos?page=1&limit=10&tipoLegajo=DOCENTE
Authorization: Bearer <token>
```

### Buscar por número
```http
GET /api/v1/legajos/numero/LEG-2001-001
Authorization: Bearer <token>
```

---

## 📋 Nombramientos

### Crear nombramiento
```http
POST /api/v1/nombramientos
Authorization: Bearer <token>
Content-Type: application/json

{
  "legajoId": "<id-de-legajo>",
  "cargoId": "<id-de-cargo>",
  "tipoNombramiento": "Profesor Titular",
  "categoria": "L33",
  "fechaInicio": "2024-01-01",
  "resolucionNumero": "RES-2024-001",
  "salarioMensual": 3000000,
  "estadoNombramiento": "VIGENTE"
}
```

### Agregar asignación salarial
```http
POST /api/v1/nombramientos/<id>/asignaciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoriaPresupuestaria": "L33",
  "monto": 500000,
  "fechaDesde": "2024-01-01",
  "descripcion": "Bonificación adicional"
}
```

### Listar nombramientos vigentes
```http
GET /api/v1/nombramientos/vigentes
Authorization: Bearer <token>
```

---

## 🏛️ Facultades

### Crear facultad
```http
POST /api/v1/facultades
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombreFacultad": "Facultad de Ingeniería",
  "codigo": "FI",
  "tipo": "FACULTAD",
  "descripcion": "Facultad de carreras de ingeniería"
}
```

### Listar facultades
```http
GET /api/v1/facultades?page=1&limit=10&tipo=FACULTAD
Authorization: Bearer <token>
```

### Obtener estadísticas
```http
GET /api/v1/facultades/stats
Authorization: Bearer <token>
```

---

## 💼 Cargos

### Crear cargo
```http
POST /api/v1/cargos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombreCargo": "Director de Carrera",
  "descripcion": "Responsable de la dirección académica",
  "nivelJerarquico": 2,
  "departamentoArea": "Dirección Académica"
}
```

### Listar cargos
```http
GET /api/v1/cargos?page=1&limit=10&nivelJerarquico=2
Authorization: Bearer <token>
```

---

## ✅ Tests de Validación

### 1. Validar CI único
Intentar crear una persona con CI duplicado:
```http
POST /api/v1/personas
{
  "numeroCedula": "1234567",  # Ya existe
  "nombres": "Test",
  "apellidos": "Usuario"
}
```
**Esperado:** Error 409 Conflict

### 2. Validar protección de eliminación
Intentar eliminar una facultad con legajos:
```http
DELETE /api/v1/facultades/<id-con-legajos>
```
**Esperado:** Error 409 Conflict con mensaje descriptivo

### 3. Validar auto-numeración de legajos
Crear múltiples legajos y verificar números:
- LEG-2026-0001
- LEG-2026-0002
- LEG-2026-0003

### 4. Validar guards de roles
Intentar crear persona sin ser ADMIN o RECURSOS_HUMANOS:
**Esperado:** Error 403 Forbidden

---

## 📊 Datos de Seed Disponibles

El seed creó:
- **Usuario admin:** admin@unae.edu.py / Admin123!
- **4 Facultades:** FCEA, FCA, FCT, FHCS
- **5 Cargos:** Docente Investigador, Profesor Asistente, etc.
- **6 Categorías:** L33, UU5, L23, B06, L11, L06
- **1 Persona:** María Nieves Florentín Núñez
- **1 Legajo:** LEG-2001-001
- **7 Nombramientos** con asignaciones salariales

Puedes usar estos datos para testing.

---

## 🔍 Tests Recomendados en Swagger

1. **Login y obtener token**
2. **Listar todas las facultades** (verás las 4 del seed)
3. **Listar todos los cargos** (verás los 5 del seed)
4. **Buscar persona por CI:** 1234567
5. **Buscar legajo por número:** LEG-2001-001
6. **Ver nombramientos vigentes** (verás los 7 del seed)
7. **Crear nueva persona** con tus datos
8. **Crear legajo** para esa persona
9. **Crear nombramiento** para ese legajo
10. **Ver estadísticas** de cada módulo

---

*Base de datos lista con datos de prueba* ✅
