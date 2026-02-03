import apiService from './api.service';
import type { CategoriaPresupuestaria } from '../types';

interface CategoriasResponse {
  success: boolean;
  data: CategoriaPresupuestaria[];
}

interface CategoriaResponse {
  success: boolean;
  data: CategoriaPresupuestaria;
}

const categoriasService = {
  getAll: async (vigente?: boolean): Promise<CategoriaPresupuestaria[]> => {
    const url = vigente !== undefined 
      ? `/categorias-presupuestarias?vigente=${vigente}`
      : '/categorias-presupuestarias';
    const response = await apiService.get<CategoriasResponse>(url);
    console.log('categoriasService.getAll - response.data:', response.data);
    return response.data.data || [];
  },
  
  getById: async (id: string): Promise<CategoriaPresupuestaria> => {
    const response = await apiService.get<CategoriaResponse>(`/categorias-presupuestarias/${id}`);
    return response.data.data;
  },
  
  create: async (data: Omit<CategoriaPresupuestaria, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoriaPresupuestaria> => {
    const response = await apiService.post<CategoriaResponse>('/categorias-presupuestarias', data);
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<CategoriaPresupuestaria>): Promise<CategoriaPresupuestaria> => {
    const response = await apiService.patch<CategoriaResponse>(`/categorias-presupuestarias/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/categorias-presupuestarias/${id}`);
  },
  
  toggleVigente: async (id: string): Promise<CategoriaPresupuestaria> => {
    const response = await apiService.patch<CategoriaResponse>(`/categorias-presupuestarias/${id}/toggle-vigente`, {});
    return response.data.data;
  },
};

export default categoriasService;
