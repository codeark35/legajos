import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personasService } from '../services/personas.service';
import type { Persona } from '../types';

export function usePersonas(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['personas', params],
    queryFn: () => personasService.getAll(params),
  });
}

export function usePersona(id: string, options?: any) {
  return useQuery({
    queryKey: ['personas', id],
    queryFn: () => personasService.getById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useCreatePersona() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: personasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Persona> }) =>
      personasService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      queryClient.invalidateQueries({ queryKey: ['personas', variables.id] });
    },
  });
}

export function useDeletePersona() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: personasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
  });
}
