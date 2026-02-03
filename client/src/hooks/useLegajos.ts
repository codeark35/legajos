import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api.service';

interface Legajo {
  id: string;
  numeroLegajo: string;
  personaId: string;
  facultadId: string;
  fechaApertura: string;
  estadoLegajo: string;
  tipoLegajo: string;
  observaciones?: string;
  persona?: any;
  facultad?: any;
  nombramientos?: any[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    nombramientos: number;
    documentos: number;
  };
}

interface CreateLegajoDto {
  numeroLegajo: string;
  personaId: string;
  facultadId: string;
  fechaApertura?: string;
  estadoLegajo?: string;
  tipoLegajo?: string;
  observaciones?: string;
}

const legajosService = {
  getAll: async (params?: any) => {
    const { data } = await apiService.get<any>('/legajos', { params });
    return data;
  },
  getById: async (id: string) => {
    const response = await apiService.get<{ success: boolean; data: Legajo }>(`/legajos/${id}`);
    return response.data.data; // Extraer data.data porque el backend devuelve { success: true, data: {...} }
  },
  create: async (legajo: CreateLegajoDto) => {
    const response = await apiService.post<{ success: boolean; data: Legajo }>('/legajos', legajo);
    return response.data.data;
  },
  update: async (id: string, legajo: Partial<CreateLegajoDto>) => {
    const response = await apiService.patch<{ success: boolean; data: Legajo }>(`/legajos/${id}`, legajo);
    return response.data.data;
  },
  delete: async (id: string) => {
    await apiService.delete(`/legajos/${id}`);
  },
};

export function useLegajos(params?: any) {
  return useQuery({
    queryKey: ['legajos', params],
    queryFn: () => legajosService.getAll(params),
  });
}

export function useLegajo(id: string, options?: any) {
  return useQuery({
    queryKey: ['legajos', id],
    queryFn: () => legajosService.getById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useCreateLegajo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: legajosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legajos'] });
    },
  });
}

export function useUpdateLegajo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLegajoDto> }) =>
      legajosService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legajos'] });
      queryClient.invalidateQueries({ queryKey: ['legajos', variables.id] });
    },
  });
}

export function useDeleteLegajo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: legajosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legajos'] });
    },
  });
}
