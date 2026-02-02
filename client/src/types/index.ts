// Tipos de usuario y autenticación
export interface Usuario {
  id: string;
  nombreUsuario: string;
  email: string;
  rol: RolUsuario;
  ultimoAcceso?: Date;
}

export const RolUsuario = {
  ADMIN: 'ADMIN',
  RECURSOS_HUMANOS: 'RECURSOS_HUMANOS',
  CONSULTA: 'CONSULTA',
  USUARIO: 'USUARIO',
} as const;

export type RolUsuario = (typeof RolUsuario)[keyof typeof RolUsuario];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: Usuario;
}

// Tipos de Persona
export interface Persona {
  id: string;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: Date;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: EstadoPersona;
  createdAt: Date;
  updatedAt: Date;
}

export const EstadoPersona = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
} as const;

export type EstadoPersona = (typeof EstadoPersona)[keyof typeof EstadoPersona];

export interface CreatePersonaDto {
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

// Tipos de Legajo
export interface Legajo {
  id: string;
  numeroLegajo: string;
  personaId: string;
  persona?: Persona;
  tipoLegajo: TipoLegajo;
  facultadId?: string;
  facultad?: Facultad;
  estadoLegajo: EstadoLegajo;
  fechaApertura: Date;
  fechaCierre?: Date;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TipoLegajo = {
  DOCENTE: 'DOCENTE',
  FUNCIONARIO: 'FUNCIONARIO',
  CONTRATADO: 'CONTRATADO',
} as const;

export type TipoLegajo = (typeof TipoLegajo)[keyof typeof TipoLegajo];

export const EstadoLegajo = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  ARCHIVADO: 'ARCHIVADO',
  CANCELADO: 'CANCELADO',
} as const;

export type EstadoLegajo = (typeof EstadoLegajo)[keyof typeof EstadoLegajo];

export interface CreateLegajoDto {
  personaId: string;
  tipoLegajo: TipoLegajo;
  facultadId?: string;
  fechaApertura: string;
  observaciones?: string;
}

// Tipos de Nombramiento
export interface Nombramiento {
  id: string;
  legajoId: string;
  legajo?: Legajo;
  cargoId?: string;
  cargo?: Cargo;
  tipoNombramiento: string;
  categoria?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  resolucionNumero?: string;
  resolucionFecha?: Date;
  resolucionId?: string;
  salarioMensual?: number;
  moneda: string;
  estadoNombramiento: EstadoNombramiento;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const EstadoNombramiento = {
  VIGENTE: 'VIGENTE',
  FINALIZADO: 'FINALIZADO',
  SUSPENDIDO: 'SUSPENDIDO',
  CANCELADO: 'CANCELADO',
} as const;

export type EstadoNombramiento = (typeof EstadoNombramiento)[keyof typeof EstadoNombramiento];

export interface CreateNombramientoDto {
  legajoId: string;
  cargoId?: string;
  tipoNombramiento: string;
  categoria?: string;
  fechaInicio: string;
  fechaFin?: string;
  resolucionNumero?: string;
  resolucionFecha?: string;
  resolucionId?: string;
  salarioMensual?: number;
  moneda?: string;
  estadoNombramiento?: EstadoNombramiento;
  observaciones?: string;
}

// Tipos de Facultad
export interface Facultad {
  id: string;
  nombreFacultad: string;
  codigo?: string;
  tipo: TipoFacultad;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TipoFacultad = {
  FACULTAD: 'FACULTAD',
  DEPARTAMENTO: 'DEPARTAMENTO',
  CENTRO: 'CENTRO',
  INSTITUTO: 'INSTITUTO',
  DIRECCION: 'DIRECCION',
} as const;

export type TipoFacultad = (typeof TipoFacultad)[keyof typeof TipoFacultad];

export interface CreateFacultadDto {
  nombreFacultad: string;
  codigo?: string;
  tipo: TipoFacultad;
  descripcion?: string;
}

// Tipos de Cargo
export interface Cargo {
  id: string;
  nombreCargo: string;
  descripcion?: string;
  nivelJerarquico?: number;
  departamentoArea?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCargoDto {
  nombreCargo: string;
  descripcion?: string;
  nivelJerarquico?: number;
  departamentoArea?: string;
}

// Tipos de paginación
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
