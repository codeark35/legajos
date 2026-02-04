import apiService from './api.service';

export interface Cargo {
  id: string;
  nombreCargo: string;
  descripcion?: string;
  nivel?: string;
  salarioBase?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

const cargosService = {
  getAll: async (): Promise<Cargo[]> => {
    const response = await apiService.get<{ success: boolean; data: Cargo[] }>('/cargos');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Cargo> => {
    const response = await apiService.get<{ success: boolean; data: Cargo }>(`/cargos/${id}`);
    return response.data.data;
  },

  create: async (dto: Partial<Cargo>): Promise<Cargo> => {
    const response = await apiService.post<{ success: boolean; data: Cargo }>('/cargos', dto);
    return response.data.data;
  },

  update: async (id: string, dto: Partial<Cargo>): Promise<Cargo> => {
    const response = await apiService.patch<{ success: boolean; data: Cargo }>(`/cargos/${id}`, dto);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/cargos/${id}`);
  },
};

export default cargosService;
