import { apiService } from './api.service';
import type { Persona, CreatePersonaDto, PaginatedResponse, PaginationParams } from '../types';

class PersonasService {
  async getAll(params?: PaginationParams & { search?: string; estado?: string }) {
    const response = await apiService.get<{ success: boolean; data: PaginatedResponse<Persona> }>('/personas', { params });
    console.log(response.data);
    return response.data.data; // response.data.data contiene { data: [...], pagination: {...} }
  }

  async getById(id: string) {
    const response = await apiService.get<{ success: boolean; data: Persona }>(`/personas/${id}`);
    return response.data.data;
  }

  async getByCedula(numeroCedula: string) {
    const response = await apiService.get<{ success: boolean; data: Persona }>(`/personas/cedula/${numeroCedula}`);
    return response.data.data;
  }

  async create(data: CreatePersonaDto) {
    const response = await apiService.post<{ success: boolean; data: Persona }>('/personas', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<CreatePersonaDto>) {
    const response = await apiService.patch<{ success: boolean; data: Persona }>(`/personas/${id}`, data);
    return response.data.data;
  }

  async delete(id: string) {
    const response = await apiService.delete(`/personas/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await apiService.get('/personas/stats');
    return response.data;
  }
}

export const personasService = new PersonasService();
