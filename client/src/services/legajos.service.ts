import apiService from './api.service';

/**
 * API Service centralizado para Legajos
 * Según guía de instrucciones para frontend
 */

export interface Legajo {
  id: string;
  numeroLegajo: string;
  personaId: string;
  tipoLegajo: string;
  estadoLegajo: string;
  fechaApertura: string;
  observaciones?: string;
  persona?: any;
}

export interface CreateLegajoDto {
  numeroLegajo: string;
  personaId: string;
  tipoLegajo: string;
  estadoLegajo: string;
  fechaApertura: string;
  facultadId?: string;
  observaciones?: string;
}

export const legajosAPI = {
  /**
   * GET todos los legajos
   */
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    try {
      const { data } = await apiService.get('/legajos', { params });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cargar legajos');
    }
  },

  /**
   * GET legajo por ID
   */
  getById: async (id: string) => {
    try {
      const { data } = await apiService.get(`/legajos/${id}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Legajo no encontrado');
      }
      throw new Error(error.response?.data?.message || 'Error al cargar legajo');
    }
  },

  /**
   * POST crear legajo
   */
  create: async (legajoData: CreateLegajoDto) => {
    try {
      const { data } = await apiService.post('/legajos', legajoData);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear legajo');
    }
  },

  /**
   * PATCH actualizar legajo
   */
  update: async (id: string, legajoData: Partial<CreateLegajoDto>) => {
    try {
      const { data } = await apiService.patch(`/legajos/${id}`, legajoData);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar legajo');
    }
  },

  /**
   * DELETE eliminar legajo
   */
  delete: async (id: string) => {
    try {
      const { data } = await apiService.delete(`/legajos/${id}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar legajo');
    }
  },

  /**
   * GET histórico de un legajo
   */
  getHistorico: async (id: string, anio?: number) => {
    try {
      const url = anio ? `/legajos/${id}/historico/${anio}` : `/legajos/${id}/historico`;
      const { data } = await apiService.get(url);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cargar histórico');
    }
  },

  /**
   * POST agregar mes a legajo
   */
  agregarMes: async (
    legajoId: string,
    anio: number,
    mes: number,
    mesData: {
      presupuestado: number;
      devengado: number;
      aporte_jubilatorio: number;
      observaciones?: string;
    }
  ) => {
    try {
      // Validar datos antes de enviar
      if (!anio || !mes) {
        throw new Error('Año y mes son requeridos');
      }

      if (isNaN(mesData.presupuestado) || mesData.presupuestado < 0) {
        throw new Error('Monto presupuestado inválido');
      }

      const { data } = await apiService.post(`/legajos/${legajoId}/agregar-mes`, {
        anio: String(anio),
        mes: String(mes).padStart(2, '0'),
        presupuestado: parseFloat(mesData.presupuestado.toString()),
        devengado: parseFloat(mesData.devengado.toString()),
        aporte_jubilatorio: parseFloat(mesData.aporte_jubilatorio.toString()),
        observaciones: mesData.observaciones || ''
      });

      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al agregar mes');
    }
  }
};

export default legajosAPI;
