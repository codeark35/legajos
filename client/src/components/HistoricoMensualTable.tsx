import { useState } from 'react';
import { useToast } from './ToastContainer';
import ConfirmModal from './ConfirmModal';

interface DatosMes {
  presupuestado: number;
  devengado: number;
  aportesPatronales?: number;
  aportesPersonales?: number;
  observaciones?: string;
  fechaRegistro?: string;
}

interface HistoricoMensualTableProps {
  historico: Record<string, Record<string, DatosMes>>;
  onEliminarMes: (anio: number, mes: number) => Promise<void>;
  onEditarMes: (anio: number, mes: number) => void;
  isLoading?: boolean;
}

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function HistoricoMensualTable({
  historico,
  onEliminarMes,
  onEditarMes,
  isLoading = false,
}: HistoricoMensualTableProps) {
  const [mesAEliminar, setMesAEliminar] = useState<{ anio: number; mes: number } | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const toast = useToast();

  // Convertir histórico en array ordenado (más reciente primero)
  const mesesOrdenados: Array<{ anio: number; mes: number; datos: DatosMes }> = [];
  
  Object.keys(historico || {})
    .sort((a, b) => parseInt(b) - parseInt(a)) // Años descendente
    .forEach((anio) => {
      Object.keys(historico[anio])
        .sort((a, b) => parseInt(b) - parseInt(a)) // Meses descendente
        .forEach((mes) => {
          mesesOrdenados.push({
            anio: parseInt(anio),
            mes: parseInt(mes),
            datos: historico[anio][mes],
          });
        });
    });

  // Calcular totales
  const totales = mesesOrdenados.reduce(
    (acc, item) => ({
      presupuestado: acc.presupuestado + (item.datos.presupuestado || 0),
      devengado: acc.devengado + (item.datos.devengado || 0),
      aportesPatronales: acc.aportesPatronales + (item.datos.aportesPatronales || 0),
      aportesPersonales: acc.aportesPersonales + (item.datos.aportesPersonales || 0),
    }),
    { presupuestado: 0, devengado: 0, aportesPatronales: 0, aportesPersonales: 0 }
  );

  const handleEliminarConfirm = async () => {
    if (!mesAEliminar) return;

    setEliminando(true);
    try {
      await onEliminarMes(mesAEliminar.anio, mesAEliminar.mes);
      toast.success('Mes eliminado exitosamente');
      setMesAEliminar(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar mes');
    } finally {
      setEliminando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando histórico...</span>
        </div>
      </div>
    );
  }

  if (mesesOrdenados.length === 0) {
    return (
      <div className="alert alert-info mb-0">
        <i className="bi bi-info-circle me-2"></i>
        No hay registros mensuales disponibles. Haz clic en "Agregar Mes" para comenzar.
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-sm table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="text-nowrap">Período</th>
              <th className="text-end text-nowrap">Presupuestado</th>
              <th className="text-end text-nowrap">Devengado</th>
              <th className="text-end text-nowrap d-none d-md-table-cell">Aporte Patronal</th>
              <th className="text-end text-nowrap d-none d-lg-table-cell">Aporte Personal</th>
              <th className="d-none d-xl-table-cell">Observaciones</th>
              <th className="text-end text-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesesOrdenados.map(({ anio, mes, datos }) => (
              <tr key={`${anio}-${mes}`}>
                <td>
                  <strong>{MESES_NOMBRES[mes - 1]} {anio}</strong>
                </td>
                <td className="text-end">{formatCurrency(datos.presupuestado)}</td>
                <td className="text-end">{formatCurrency(datos.devengado)}</td>
                <td className="text-end d-none d-md-table-cell">
                  {datos.aportesPatronales ? formatCurrency(datos.aportesPatronales) : '-'}
                </td>
                <td className="text-end d-none d-lg-table-cell">
                  {datos.aportesPersonales ? formatCurrency(datos.aportesPersonales) : '-'}
                </td>
                <td className="d-none d-xl-table-cell">
                  <small className="text-muted">
                    {datos.observaciones || '-'}
                  </small>
                </td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => onEditarMes(anio, mes)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => setMesAEliminar({ anio, mes })}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-light">
            <tr>
              <td><strong>TOTAL</strong></td>
              <td className="text-end"><strong>{formatCurrency(totales.presupuestado)}</strong></td>
              <td className="text-end"><strong>{formatCurrency(totales.devengado)}</strong></td>
              <td className="text-end d-none d-md-table-cell">
                <strong>{formatCurrency(totales.aportesPatronales)}</strong>
              </td>
              <td className="text-end d-none d-lg-table-cell">
                <strong>{formatCurrency(totales.aportesPersonales)}</strong>
              </td>
              <td className="d-none d-xl-table-cell"></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmModal
        isOpen={mesAEliminar !== null}
        onClose={() => setMesAEliminar(null)}
        onConfirm={handleEliminarConfirm}
        title="Eliminar Mes"
        message={
          mesAEliminar
            ? `¿Estás seguro de eliminar el registro de ${MESES_NOMBRES[mesAEliminar.mes - 1]} ${mesAEliminar.anio}?`
            : ''
        }
        variant="danger"
        confirmText="Eliminar"
        isLoading={eliminando}
      />
    </>
  );
}
