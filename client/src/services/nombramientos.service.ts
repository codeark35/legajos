import apiService from './api.service';

export interface Nombramiento {
  id: string;
  legajoId: string;
  cargoId: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  legajo?: {
    persona: {
      nombres: string;
      apellidos: string;
      numeroCedula: string;
    };
  };
  cargo?: {
    nombre: string;
  };
}

interface MesData {
  presupuestado: number;
  devengado: number;
  aporteJubilatorio: number;
  aportesPersonales: number;
  lineaPresupuestariaId: string;
  codigoLinea: string;
  descripcionLinea: string;
  categoriaPresupuestariaId: string;
  codigoCategoria: string;
  descripcionCategoria: string;
  objetoGasto?: string;
  observaciones?: string;
  fechaRegistro: string;
}

interface HistoricoMensual {
  [anio: string]: {
    [mes: string]: MesData;
  };
}

interface AgregarMesDto {
  anio: number;
  mes: number;
  presupuestado: number;
  devengado: number;
  aporteJubilatorio?: number;
  aportesPersonales?: number;
  lineaPresupuestariaId: string;
  categoriaPresupuestariaId: string;
  objetoGasto?: string;
  observaciones?: string;
}

interface LegajoConNombramientos {
  id: string;
  numeroLegajo: string;
  persona: {
    id: string;
    nombreCompleto: string;
    nombres: string;
    apellidos: string;
    numeroCedula: string;
  };
  facultad: {
    id: string;
    nombreFacultad: string;
  };
  nombramientos: Array<{
    id: string;
    tipoNombramiento: string;
    cargo: {
      id: string;
      nombreCargo: string;
    };
    fechaInicio: string;
    fechaFin?: string;
    vigente: boolean;
    estadoNombramiento: string;
  }>;
}

const nombramientosService = {
  getAll: async () => {
    const response = await apiService.get<{ success: boolean; data: { data: Nombramiento[]; pagination: any } }>('/nombramientos?limit=1000');
    return response.data.data.data || [];
  },

  getLegajosCompleto: async (): Promise<LegajoConNombramientos[]> => {
    const response = await apiService.get<{ success: boolean; data: LegajoConNombramientos[] }>('/nombramientos/legajos-completo');
    return response.data.data || [];
  },
  
  getHistoricoMensual: async (nombramientoId: string): Promise<{ nombramiento: any; historico: HistoricoMensual }> => {
    const response = await apiService.get(`/nombramientos/${nombramientoId}/historico`);
    return response.data.data;
  },

  agregarMes: async (nombramientoId: string, dto: AgregarMesDto) => {
    const response = await apiService.post(`/nombramientos/${nombramientoId}/agregar-mes`, dto);
    return response.data.data;
  },

  actualizarMes: async (nombramientoId: string, anio: number, mes: number, dto: AgregarMesDto) => {
    const response = await apiService.put(`/nombramientos/${nombramientoId}/mes/${anio}/${mes}`, dto);
    return response.data.data;
  },

  eliminarMes: async (nombramientoId: string, anio: number, mes: number) => {
    const response = await apiService.delete(`/nombramientos/${nombramientoId}/mes/${anio}/${mes}`);
    return response.data;
  },

  getResumen: async (nombramientoId: string) => {
    const response = await apiService.get(`/nombramientos/${nombramientoId}/resumen`);
    return response.data.data;
  },
};

export default nombramientosService;
export type { MesData, HistoricoMensual, AgregarMesDto, LegajoConNombramientos };
