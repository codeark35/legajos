import { useState, useEffect } from 'react';
import nombramientoAsignacionesService from '../services/nombramientoAsignaciones.service';
import type {
  NombramientoAsignacion,
  CreateNombramientoAsignacionDto,
  UpdateHistoricoMensualDto,
  FinalizarAsignacionDto,
  PeriodoAsignacion,
} from '../types';

export const useNombramientoAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState<NombramientoAsignacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByNombramiento = async (nombramientoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await nombramientoAsignacionesService.getByNombramiento(nombramientoId);
      setAsignaciones(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar asignaciones';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchByAsignacion = async (asignacionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await nombramientoAsignacionesService.getByAsignacion(asignacionId);
      setAsignaciones(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar nombramientos';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: CreateNombramientoAsignacionDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await nombramientoAsignacionesService.create(data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear asignación';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHistoricoMensual = async (id: string, data: UpdateHistoricoMensualDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await nombramientoAsignacionesService.updateHistoricoMensual(id, data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar histórico';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const finalizar = async (id: string, data: FinalizarAsignacionDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await nombramientoAsignacionesService.finalizar(id, data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al finalizar asignación';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAsignacion = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await nombramientoAsignacionesService.delete(id);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar asignación';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    asignaciones,
    loading,
    error,
    fetchByNombramiento,
    fetchByAsignacion,
    create,
    updateHistoricoMensual,
    finalizar,
    deleteAsignacion,
  };
};

export const useHistoricoAsignaciones = (nombramientoId?: string) => {
  const [periodos, setPeriodos] = useState<PeriodoAsignacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nombramientoId) {
      fetchHistorico(nombramientoId);
    }
  }, [nombramientoId]);

  const fetchHistorico = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await nombramientoAsignacionesService.getHistoricoAsignaciones(id);
      setPeriodos(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar histórico';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    periodos,
    loading,
    error,
    fetchHistorico,
  };
};
