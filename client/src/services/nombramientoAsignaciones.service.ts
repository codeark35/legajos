import apiService from './api.service';
import type {
  NombramientoAsignacion,
  CreateNombramientoAsignacionDto,
  UpdateHistoricoMensualDto,
  FinalizarAsignacionDto,
  HistoricoMensualData,
  PeriodoAsignacion,
} from '../types';

interface NombramientoAsignacionResponse {
  success: boolean;
  data: NombramientoAsignacion;
}

interface NombramientoAsignacionesResponse {
  success: boolean;
  data: NombramientoAsignacion[];
}

interface HistoricoResponse {
  success: boolean;
  data: Record<string, HistoricoMensualData>;
}

interface PeriodosResponse {
  success: boolean;
  data: PeriodoAsignacion[];
}

const nombramientoAsignacionesService = {
  // Crear nueva relación nombramiento-asignación
  create: async (data: CreateNombramientoAsignacionDto): Promise<NombramientoAsignacion> => {
    const response = await apiService.post<NombramientoAsignacionResponse>(
      '/nombramiento-asignaciones',
      data
    );
    return response.data.data;
  },

  // Obtener una asignación específica
  getById: async (id: string): Promise<NombramientoAsignacion> => {
    const response = await apiService.get<NombramientoAsignacionResponse>(
      `/nombramiento-asignaciones/${id}`
    );
    return response.data.data;
  },

  // Obtener todas las asignaciones de un nombramiento
  getByNombramiento: async (nombramientoId: string): Promise<NombramientoAsignacion[]> => {
    const response = await apiService.get<NombramientoAsignacionesResponse>(
      `/nombramiento-asignaciones/nombramiento/${nombramientoId}`
    );
    return response.data.data;
  },

  // Obtener todos los nombramientos con una asignación específica
  getByAsignacion: async (asignacionId: string): Promise<NombramientoAsignacion[]> => {
    const response = await apiService.get<NombramientoAsignacionesResponse>(
      `/nombramiento-asignaciones/asignacion/${asignacionId}`
    );
    return response.data.data;
  },

  // Obtener personas con una asignación en un mes específico
  getByAsignacionYMes: async (
    asignacionId: string,
    anio: number,
    mes: number
  ): Promise<NombramientoAsignacion[]> => {
    const response = await apiService.get<NombramientoAsignacionesResponse>(
      `/nombramiento-asignaciones/asignacion/${asignacionId}/mes/${anio}/${mes}`
    );
    return response.data.data;
  },

  // Actualizar histórico mensual
  updateHistoricoMensual: async (
    id: string,
    data: UpdateHistoricoMensualDto
  ): Promise<NombramientoAsignacion> => {
    const response = await apiService.patch<NombramientoAsignacionResponse>(
      `/nombramiento-asignaciones/${id}/historico`,
      data
    );
    return response.data.data;
  },

  // Obtener histórico mensual
  getHistoricoMensual: async (
    id: string,
    anio?: number,
    mes?: number
  ): Promise<Record<string, HistoricoMensualData> | HistoricoMensualData> => {
    let url = `/nombramiento-asignaciones/${id}/historico`;
    const params = new URLSearchParams();
    if (anio) params.append('anio', anio.toString());
    if (mes) params.append('mes', mes.toString());
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await apiService.get<HistoricoResponse>(url);
    return response.data.data;
  },

  // Finalizar asignación (establecer fechaFin)
  finalizar: async (id: string, data: FinalizarAsignacionDto): Promise<NombramientoAsignacion> => {
    const response = await apiService.patch<NombramientoAsignacionResponse>(
      `/nombramiento-asignaciones/${id}/finalizar`,
      data
    );
    return response.data.data;
  },

  // Eliminar asignación
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/nombramiento-asignaciones/${id}`);
  },

  // Obtener histórico de asignaciones de un nombramiento (períodos agrupados)
  getHistoricoAsignaciones: async (nombramientoId: string): Promise<PeriodoAsignacion[]> => {
    const response = await apiService.get<PeriodosResponse>(
      `/nombramientos/${nombramientoId}/asignaciones-historico`
    );
    return response.data.data;
  },

  // Obtener todas las relaciones (paginado)
  getAll: async (page: number = 1, limit: number = 50): Promise<NombramientoAsignacion[]> => {
    const response = await apiService.get<NombramientoAsignacionesResponse>(
      `/nombramiento-asignaciones?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },
};

export default nombramientoAsignacionesService;
