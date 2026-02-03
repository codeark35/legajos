import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import asignacionesService from '../services/asignaciones.service';
import type {
  AsignacionPresupuestaria,
  CreateAsignacionPresupuestariaDto,
  UpdateAsignacionPresupuestariaDto,
  HistoricoMensualData,
} from '../types';

export function useAsignaciones(params?: any) {
  return useQuery({
    queryKey: ['asignaciones', params],
    queryFn: () => asignacionesService.getAll(),
  });
}

export function useAsignacionesDisponibles() {
  return useQuery({
    queryKey: ['asignaciones', 'disponibles'],
    queryFn: () => asignacionesService.getDisponibles(),
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
    queryFn: () => asignacionesService.getHistorico(id, anio, mes),
    enabled: !!id && id !== 'nueva' && !!anio && !!mes,
  });
}

export function useHistoricoAnio(id: string, anio: number) {
  return useQuery({
    queryKey: ['asignaciones', id, 'historico', anio],
    queryFn: () => asignacionesService.getHistorico(id, anio),
    enabled: !!id && id !== 'nueva' && !!anio,
  });
}

export function useHistoricoCompleto(id: string) {
  return useQuery({
    queryKey: ['asignaciones', id, 'historico'],
    queryFn: () => asignacionesService.getHistorico(id),
    enabled: !!id && id !== 'nueva',
  });
}

export function useAuditoriaAsignacion(id: string, anio?: number, mes?: number) {
  return useQuery({
    queryKey: ['asignaciones', id, 'auditoria', anio, mes],
    queryFn: () => asignacionesService.getAuditoria(id, anio, mes),
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

export function useUpdateAsignacion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAsignacionPresupuestariaDto }) =>
      asignacionesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id] });
    },
  });
}

export function useDeleteAsignacion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: asignacionesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}

export function useAgregarMes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, anio, mes, datos }: { id: string; anio: number; mes: number; datos: Partial<HistoricoMensualData> }) =>
      asignacionesService.updateHistoricoMensual(id, anio, mes, datos),
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
      asignacionesService.deleteHistoricoMensual(id, anio, mes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id, 'historico'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones', variables.id, 'auditoria'] });
    },
  });
}
