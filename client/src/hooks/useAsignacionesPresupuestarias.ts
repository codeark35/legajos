import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api.service';

interface AsignacionPresupuestaria {
  id: string;
  nombramientoId: string;
  categoriaPresupuestariaId: string;
  lineaPresupuestariaId: string;
  montoBase: number;
  fechaInicio: string;
  fechaFin?: string;
  historicoMensual: any;
}

interface CreateAsignacionDto {
  nombramientoId: string;
  categoriaPresupuestariaId: string;
  lineaPresupuestariaId: string;
  montoBase: number;
  fechaInicio: string;
  fechaFin?: string;
}

interface HistoricoMensualDto {
  montoTotal: number;
  horasExtras?: number;
  bonificaciones?: number;
  descuentos?: number;
  observaciones?: string;
}

const asignacionesService = {
  getAll: async (params?: any) => {
    const { data } = await apiService.get<any>('/asignaciones-presupuestarias', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiService.get<AsignacionPresupuestaria>(`/asignaciones-presupuestarias/${id}`);
    return data;
  },
  create: async (asignacion: CreateAsignacionDto) => {
    const { data } = await apiService.post<AsignacionPresupuestaria>('/asignaciones-presupuestarias', asignacion);
    return data;
  },
  update: async (id: string, asignacion: Partial<CreateAsignacionDto>) => {
    const { data } = await apiService.patch<AsignacionPresupuestaria>(`/asignaciones-presupuestarias/${id}`, asignacion);
    return data;
  },
  delete: async (id: string) => {
    await apiService.delete(`/asignaciones-presupuestarias/${id}`);
  },
  
  // Métodos para histórico mensual
  agregarMes: async (id: string, anio: number, mes: number, datos: HistoricoMensualDto) => {
    const { data } = await apiService.post(`/asignaciones-presupuestarias/${id}/historico/${anio}/${mes}`, datos);
    return data;
  },
  obtenerMes: async (id: string, anio: number, mes: number) => {
    const { data } = await apiService.get(`/asignaciones-presupuestarias/${id}/historico/${anio}/${mes}`);
    return data;
  },
  obtenerAnio: async (id: string, anio: number) => {
    const { data } = await apiService.get(`/asignaciones-presupuestarias/${id}/historico/${anio}`);
    return data;
  },
  actualizarAnio: async (id: string, anio: number, datos: any) => {
    const { data } = await apiService.put(`/asignaciones-presupuestarias/${id}/historico/${anio}`, datos);
    return data;
  },
  eliminarMes: async (id: string, anio: number, mes: number) => {
    await apiService.delete(`/asignaciones-presupuestarias/${id}/historico/${anio}/${mes}`);
  },
  eliminarAnio: async (id: string, anio: number) => {
    await apiService.delete(`/asignaciones-presupuestarias/${id}/historico/${anio}`);
  },
  
  // Auditoría
  obtenerAuditoria: async (id: string) => {
    const { data } = await apiService.get(`/asignaciones-presupuestarias/${id}/auditoria`);
    return data;
  },
  obtenerAuditoriaMes: async (id: string, anio: number, mes: number) => {
    const { data } = await apiService.get(`/asignaciones-presupuestarias/${id}/auditoria/${anio}/${mes}`);
    return data;
  },
};

export function useAsignaciones(params?: any) {
  return useQuery({
    queryKey: ['asignaciones', params],
    queryFn: () => asignacionesService.getAll(params),
  });
}

export function useAsignacion(id: string, options?: any) {
  return useQuery({
    queryKey: ['asignaciones', id],
    queryFn: () => asignacionesService.getById(id),
    enabled: options?.enabled !== undefined ? options.enabled : (!!id && id !== 'nueva'),
  });
}

export function useHistoricoMes(id: string, anio: number, mes: number) {
  return useQuery({
    queryKey: ['asignaciones', id, 'historico', anio, mes],
    queryFn: () => asignacionesService.obtenerMes(id, anio, mes),
    enabled: !!id && id !== 'nueva' && !!anio && !!mes,
  });
}

export function useHistoricoAnio(id: string, anio: number) {
  return useQuery({
    queryKey: ['asignaciones', id, 'historico', anio],
    queryFn: () => asignacionesService.obtenerAnio(id, anio),
    enabled: !!id && id !== 'nueva' && !!anio,
  });
}

export function useAuditoriaAsignacion(id: string) {
  return useQuery({
    queryKey: ['asignaciones', id, 'auditoria'],
    queryFn: () => asignacionesService.obtenerAuditoria(id),
    enabled: !!id && id !== 'nueva',
  });
}

export function useCreateAsignacion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: asignacionesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}

export function useAgregarMes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, anio, mes, datos }: { id: string; anio: number; mes: number; datos: HistoricoMensualDto }) =>
      asignacionesService.agregarMes(id, anio, mes, datos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id, 'historico'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id, 'auditoria'] });
    },
  });
}

export function useEliminarMes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, anio, mes }: { id: string; anio: number; mes: number }) =>
      asignacionesService.eliminarMes(id, anio, mes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id, 'historico'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id, 'auditoria'] });
    },
  });
}
