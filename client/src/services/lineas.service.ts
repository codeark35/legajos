import apiService from './api.service';
import type { LineaPresupuestaria } from '../types';

interface LineasResponse {
  success: boolean;
  data: LineaPresupuestaria[];
}

interface LineaResponse {
  success: boolean;
  data: LineaPresupuestaria;
}

const lineasService = {
  getAll: async (vigente?: boolean): Promise<LineaPresupuestaria[]> => {
    const url = vigente !== undefined 
      ? `/lineas-presupuestarias?vigente=${vigente}`
      : '/lineas-presupuestarias';
    const response = await apiService.get<LineasResponse>(url);
    console.log('lineasService.getAll - response.data:', response.data);
    return response.data.data || [];
  },
  
  getById: async (id: string): Promise<LineaPresupuestaria> => {
    const response = await apiService.get<LineaResponse>(`/lineas-presupuestarias/${id}`);
    return response.data.data;
  },
  
  create: async (data: Omit<LineaPresupuestaria, 'id' | 'createdAt' | 'updatedAt'>): Promise<LineaPresupuestaria> => {
    const response = await apiService.post<LineaResponse>('/lineas-presupuestarias', data);
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<LineaPresupuestaria>): Promise<LineaPresupuestaria> => {
    const response = await apiService.patch<LineaResponse>(`/lineas-presupuestarias/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/lineas-presupuestarias/${id}`);
  },
  
  toggleVigente: async (id: string): Promise<LineaPresupuestaria> => {
    const response = await apiService.patch<LineaResponse>(`/lineas-presupuestarias/${id}/toggle-vigente`, {});
    return response.data.data;
  },
};

export default lineasService;
