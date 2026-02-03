import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import { useNombramientoAsignaciones } from '../hooks/useNombramientoAsignaciones';
import asignacionesService from '../services/asignaciones.service';
import type { CreateNombramientoAsignacionDto } from '../types';

export default function NombramientoAsignacionFormPage() {
  const { nombramientoId } = useParams<{ nombramientoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { create, loading } = useNombramientoAsignaciones();

  const legajoNombre = searchParams.get('nombre') || '';

  const [formData, setFormData] = useState<CreateNombramientoAsignacionDto>({
    nombramientoId: nombramientoId || '',
    asignacionPresupuestariaId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar asignaciones disponibles
  const { data: asignaciones = [], isLoading: loadingAsignaciones } = useQuery({
    queryKey: ['asignaciones', 'disponibles'],
    queryFn: () => asignacionesService.getDisponibles(),
  });

  const handleChange = (field: keyof CreateNombramientoAsignacionDto, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.asignacionPresupuestariaId) {
      newErrors.asignacionPresupuestariaId = 'Debe seleccionar una asignación presupuestaria';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (fin < inicio) {
        newErrors.fechaFin = 'La fecha fin no puede ser anterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    try {
      await create(formData);
      toast.success('Asignación presupuestaria vinculada exitosamente');
      navigate(-1);
    } catch (error: any) {
      console.error('Error al crear relación:', error);
      toast.error(error.message || 'Error al vincular asignación presupuestaria');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loadingAsignaciones) {
    return (
      <Layout title="Asignar Plaza Presupuestaria">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Asignar Plaza Presupuestaria">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Asignar Plaza Presupuestaria
          </h2>
          {legajoNombre && (
            <p className="mt-2 text-sm text-gray-600">
              Persona: <span className="font-semibold">{legajoNombre}</span>
            </p>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Asignación Presupuestaria */}
            <div>
              <label htmlFor="asignacionPresupuestariaId" className="block text-sm font-medium text-gray-700 mb-1">
                Plaza Presupuestaria <span className="text-red-500">*</span>
              </label>
              <select
                id="asignacionPresupuestariaId"
                value={formData.asignacionPresupuestariaId}
                onChange={(e) => handleChange('asignacionPresupuestariaId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.asignacionPresupuestariaId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione una plaza</option>
                {asignaciones.map((asig) => (
                  <option key={asig.id} value={asig.id}>
                    {asig.codigo || asig.id.substring(0, 8)} - 
                    {asig.descripcion || 'Sin descripción'} - 
                    Salario Base: {asig.salarioBase.toLocaleString()} {asig.moneda}
                    {asig.categoriaPresupuestaria && ` - Cat: ${asig.categoriaPresupuestaria.codigoCategoria}`}
                  </option>
                ))}
              </select>
              {errors.asignacionPresupuestariaId && (
                <p className="mt-1 text-sm text-red-600">{errors.asignacionPresupuestariaId}</p>
              )}
            </div>

            {/* Fecha Inicio */}
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fechaInicio"
                value={formData.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaInicio && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaInicio}</p>
              )}
            </div>

            {/* Fecha Fin (Opcional) */}
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin <span className="text-gray-400">(Opcional)</span>
              </label>
              <input
                type="date"
                id="fechaFin"
                value={formData.fechaFin || ''}
                onChange={(e) => handleChange('fechaFin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fechaFin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaFin && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaFin}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Dejar en blanco si la asignación no tiene fecha de finalización
              </p>
            </div>

            {/* Observaciones */}
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                rows={3}
                value={formData.observaciones || ''}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notas adicionales sobre esta asignación..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Asignar Plaza
            </button>
          </div>
        </form>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Una persona puede tener múltiples plazas presupuestarias en diferentes períodos</li>
            <li>• Múltiples personas pueden compartir la misma plaza presupuestaria</li>
            <li>• Después de asignar, podrá cargar datos mensuales de gestión</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
