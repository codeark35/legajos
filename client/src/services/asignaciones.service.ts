import apiService from './api.service';
import type {
  AsignacionPresupuestaria,
  CreateAsignacionPresupuestariaDto,
  UpdateAsignacionPresupuestariaDto,
  PaginatedResponse,
  HistoricoMensualData,
} from '../types';

interface AsignacionesResponse {
  success: boolean;
  data: AsignacionPresupuestaria[] | PaginatedResponse<AsignacionPresupuestaria>;
}

interface AsignacionResponse {
  success: boolean;
  data: AsignacionPresupuestaria;
}

interface HistoricoResponse {
  success: boolean;
  data: Record<string, HistoricoMensualData>;
}

const asignacionesService = {
  // Obtener todas las asignaciones
  getAll: async (): Promise<AsignacionPresupuestaria[]> => {
    const response = await apiService.get<AsignacionesResponse>('/asignaciones-presupuestarias?limit=1000');
    const responseData = response.data.data;
    
    // Verificar si es paginado o array directo
    if (Array.isArray(responseData)) {
      return responseData;
    }
    return (responseData as PaginatedResponse<AsignacionPresupuestaria>).data || [];
  },

  // Obtener asignaciones disponibles (vigentes)
  getDisponibles: async (): Promise<AsignacionPresupuestaria[]> => {
    const response = await apiService.get<AsignacionesResponse>('/asignaciones-presupuestarias/disponibles');
    return response.data.data as AsignacionPresupuestaria[];
  },

  // Obtener una asignación por ID
  getById: async (id: string): Promise<AsignacionPresupuestaria> => {
    const response = await apiService.get<AsignacionResponse>(`/asignaciones-presupuestarias/${id}`);
    return response.data.data;
  },

  // Crear nueva asignación presupuestaria
  create: async (data: CreateAsignacionPresupuestariaDto): Promise<AsignacionPresupuestaria> => {
    const response = await apiService.post<AsignacionResponse>('/asignaciones-presupuestarias', data);
    return response.data.data;
  },

  // Actualizar asignación
  update: async (id: string, data: UpdateAsignacionPresupuestariaDto): Promise<AsignacionPresupuestaria> => {
    const response = await apiService.patch<AsignacionResponse>(`/asignaciones-presupuestarias/${id}`, data);
    return response.data.data;
  },

  // Eliminar asignación
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/asignaciones-presupuestarias/${id}`);
  },

  // Obtener histórico mensual consolidado
  getHistorico: async (id: string, anio?: number, mes?: number): Promise<Record<string, HistoricoMensualData>> => {
    let url = `/asignaciones-presupuestarias/${id}/historico`;
    if (anio && mes) {
      url += `/${anio}/${mes}`;
    } else if (anio) {
      url += `/${anio}`;
    }
    const response = await apiService.get<HistoricoResponse>(url);
    return response.data.data;
  },

  // Actualizar histórico mensual consolidado
  updateHistoricoMensual: async (
    id: string,
    anio: number,
    mes: number,
    data: Partial<HistoricoMensualData>
  ): Promise<AsignacionPresupuestaria> => {
    const response = await apiService.post<AsignacionResponse>(
      `/asignaciones-presupuestarias/${id}/historico/${anio}/${mes}`,
      data
    );
    return response.data.data;
  },

  // Eliminar histórico mensual
  deleteHistoricoMensual: async (id: string, anio: number, mes: number): Promise<void> => {
    await apiService.delete(`/asignaciones-presupuestarias/${id}/historico/${anio}/${mes}`);
  },

  // Obtener auditoría
  getAuditoria: async (id: string, anio?: number, mes?: number): Promise<any[]> => {
    let url = `/asignaciones-presupuestarias/${id}/auditoria`;
    if (anio && mes) {
      url += `/${anio}/${mes}`;
    }
    const response = await apiService.get<{ success: boolean; data: any[] }>(url);
    return response.data.data;
  },
};

export default asignacionesService;
