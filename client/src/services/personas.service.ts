import { apiService } from './api.service';
import type { Persona, CreatePersonaDto, PaginatedResponse, PaginationParams } from '../types';

class PersonasService {
  async getAll(params?: PaginationParams & { search?: string; estado?: string }) {
    const response = await apiService.get<PaginatedResponse<Persona>>('/personas', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await apiService.get<Persona>(`/personas/${id}`);
    return response.data;
  }

  async getByCedula(numeroCedula: string) {
    const response = await apiService.get<Persona>(`/personas/cedula/${numeroCedula}`);
    return response.data;
  }

  async create(data: CreatePersonaDto) {
    const response = await apiService.post<Persona>('/personas', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreatePersonaDto>) {
    const response = await apiService.patch<Persona>(`/personas/${id}`, data);
    return response.data;
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
