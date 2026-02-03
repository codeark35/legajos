import apiService from './api.service';
import type { PeriodoAsignacion } from '../types';

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

interface PeriodosResponse {
  success: boolean;
  data: PeriodoAsignacion[];
}

const nombramientosService = {
  getAll: async () => {
    const response = await apiService.get<{ success: boolean; data: { data: Nombramiento[]; pagination: any } }>('/nombramientos?limit=1000');
    // El backend devuelve { success: true, data: { data: [...], pagination: {...} } }
    return response.data.data.data || [];
  },
  
  getSinAsignacion: async () => {
    const response = await apiService.get<{ success: boolean; data: Nombramiento[] }>('/nombramientos/sin-asignacion');
    return response.data.data || [];
  },
  
  getHistoricoAsignaciones: async (nombramientoId: string): Promise<PeriodoAsignacion[]> => {
    const response = await apiService.get<PeriodosResponse>(`/nombramientos/${nombramientoId}/asignaciones-historico`);
    return response.data.data || [];
  },
};

export default nombramientosService;
