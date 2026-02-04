import api from './api.service';

export interface Facultad {
  id: string;
  nombreFacultad: string;
  sigla: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const facultadesService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; activo?: boolean }) {
    const response = await api.get('/facultades', { params });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/facultades/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Facultad>) {
    const response = await api.post('/facultades', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Facultad>) {
    const response = await api.patch(`/facultades/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/facultades/${id}`);
    return response.data;
  },
};

export default facultadesService;
