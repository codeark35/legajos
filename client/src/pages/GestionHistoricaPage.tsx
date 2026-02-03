import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import { useNombramientoAsignaciones } from '../hooks/useNombramientoAsignaciones';
import type { UpdateHistoricoMensualDto } from '../types';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export default function GestionHistoricaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { updateHistoricoMensual, loading } = useNombramientoAsignaciones();

  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(currentYear);
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const [formData, setFormData] = useState<Omit<UpdateHistoricoMensualDto, 'anio' | 'mes'>>({
    presupuestado: 0,
    devengado: 0,
    aportesPatronales: 0,
    aportesPersonales: 0,
    descuentos: 0,
    netoRecibido: 0,
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos existentes del mes si existen
  const { data: historicoData, refetch } = useQuery({
    queryKey: ['nombramiento-asignacion-historico', id, anio, mes],
    queryFn: async () => {
      if (!id) return null;
      const service = await import('../services/nombramientoAsignaciones.service');
      return service.default.getHistoricoMensual(id, anio, mes);
    },
    enabled: !!id,
  });

  // Actualizar formulario cuando se cargan datos existentes
  useState(() => {
    if (historicoData && typeof historicoData === 'object' && !Array.isArray(historicoData)) {
      const mesKey = `${anio}-${mes.toString().padStart(2, '0')}`;
      const dataMes = (historicoData as Record<string, any>)[mesKey];
      if (dataMes) {
        setFormData({
          presupuestado: dataMes.presupuestado || 0,
          devengado: dataMes.devengado || 0,
          aportesPatronales: dataMes.aportesPatronales || 0,
          aportesPersonales: dataMes.aportesPersonales || 0,
          descuentos: dataMes.descuentos || 0,
          netoRecibido: dataMes.netoRecibido || 0,
          observaciones: dataMes.observaciones || '',
        });
      }
    }
  });

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    if (field === 'observaciones') {
      setFormData({ ...formData, [field]: value as string });
    } else {
      setFormData({ ...formData, [field]: Number(value) || 0 });
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-PY');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error('ID de asignación no válido');
      return;
    }

    const newErrors: Record<string, string> = {};
    if (formData.presupuestado <= 0) {
      newErrors.presupuestado = 'El monto presupuestado debe ser mayor a 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor corrija los errores');
      return;
    }

    try {
      const dataToSend: UpdateHistoricoMensualDto = {
        anio,
        mes,
        ...formData,
      };

      await updateHistoricoMensual(id, dataToSend);
      toast.success(`Datos de ${MESES[mes - 1].label} ${anio} guardados exitosamente`);
      refetch();
    } catch (error: any) {
      console.error('Error al guardar datos:', error);
      toast.error(error.message || 'Error al guardar datos mensuales');
    }
  };

  const handleMesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAnio(anio - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (mes === 12) {
      setMes(1);
      setAnio(anio + 1);
    } else {
      setMes(mes + 1);
    }
  };

  return (
    <Layout title="Gestión Histórica Mensual">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestión Histórica Mensual</h2>
          <p className="mt-1 text-sm text-gray-600">
            Registre los datos de presupuesto, devengado y aportes de cada mes
          </p>
        </div>

        {/* Selector de Mes/Año */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleMesAnterior}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={2000}
                max={2100}
              />
            </div>

            <button
              type="button"
              onClick={handleMesSiguiente}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Presupuestado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Presupuestado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₲</span>
                <input
                  type="number"
                  value={formData.presupuestado || ''}
                  onChange={(e) => handleChange('presupuestado', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.presupuestado ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.presupuestado && (
                <p className="mt-1 text-sm text-red-600">{errors.presupuestado}</p>
              )}
            </div>

            {/* Devengado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Devengado
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₲</span>
                <input
                  type="number"
                  value={formData.devengado || ''}
                  onChange={(e) => handleChange('devengado', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aportes Patronales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aportes Patronales
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₲</span>
                  <input
                    type="number"
                    value={formData.aportesPatronales || ''}
                    onChange={(e) => handleChange('aportesPatronales', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Aportes Personales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aportes Personales
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₲</span>
                  <input
                    type="number"
                    value={formData.aportesPersonales || ''}
                    onChange={(e) => handleChange('aportesPersonales', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Descuentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descuentos Varios
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₲</span>
                <input
                  type="number"
                  value={formData.descuentos || ''}
                  onChange={(e) => handleChange('descuentos', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Neto Recibido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neto Recibido
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₲</span>
                <input
                  type="number"
                  value={formData.netoRecibido || ''}
                  onChange={(e) => handleChange('netoRecibido', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Resumen calculado */}
            {formData.presupuestado > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 Resumen</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Presupuestado:</span>
                    <span className="font-semibold">₲ {formatCurrency(formData.presupuestado)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Devengado:</span>
                    <span className="font-semibold">₲ {formatCurrency(formData.devengado || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span>Ejecución:</span>
                    <span className="font-semibold">
                      {formData.presupuestado > 0
                        ? ((((formData.devengado || 0) / formData.presupuestado) * 100).toFixed(1))
                        : '0'}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={formData.observaciones || ''}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Volver
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
              Guardar Datos
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
