import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultadesService } from '../services/facultades.service';

export function useFacultades(params?: { search?: string; page?: number; limit?: number; activo?: boolean }) {
  return useQuery({
    queryKey: ['facultades', params],
    queryFn: () => facultadesService.getAll(params),
  });
}

export function useFacultad(id: string, options?: any) {
  return useQuery({
    queryKey: ['facultades', id],
    queryFn: () => facultadesService.getById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useCreateFacultad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: facultadesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultades'] });
    },
  });
}

export function useUpdateFacultad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      facultadesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facultades'] });
      queryClient.invalidateQueries({ queryKey: ['facultades', variables.id] });
    },
  });
}

export function useDeleteFacultad() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: facultadesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultades'] });
    },
  });
}
