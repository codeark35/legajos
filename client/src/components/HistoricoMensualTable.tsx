import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import type { MesData, HistoricoMensual } from '../services/nombramientos.service';

interface HistoricoMensualTableProps {
  historico: HistoricoMensual;
  nombramientoId: string;
  onAgregarMes: () => void;
  onEditarMes: (anio: number, mes: number, data: MesData) => void;
  onEliminarMes: (anio: number, mes: number) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function HistoricoMensualTable({
  historico,
  onAgregarMes,
  onEditarMes,
  onEliminarMes,
  disabled = false,
  isLoading = false,
}: HistoricoMensualTableProps) {
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>('');
  const [mesAEliminar, setMesAEliminar] = useState<{ anio: number; mes: number } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Obtener años disponibles
  const anios = Object.keys(historico || {}).sort((a, b) => parseInt(b) - parseInt(a));

  // Si no hay año seleccionado, seleccionar el más reciente
  React.useEffect(() => {
    if (anios.length > 0 && !anioSeleccionado) {
      setAnioSeleccionado(anios[0]);
    }
  }, [anios, anioSeleccionado]);

  // Obtener meses del año seleccionado
  const mesesDelAnio = anioSeleccionado && historico[anioSeleccionado] 
    ? historico[anioSeleccionado] 
    : {};

  // Ordenar meses del año seleccionado
  const mesesOrdenados = Object.entries(mesesDelAnio).sort((a, b) => 
    parseInt(a[0]) - parseInt(b[0])
  );

  // Calcular totales
  const totales = mesesOrdenados.reduce(
    (acc, [_, mes]) => ({
      objetoGasto: acc.objetoGasto + (mes.objetoGasto ? parseFloat(mes.objetoGasto) : 0),
      presupuestado: acc.presupuestado + (mes.presupuestado || 0),
      devengado: acc.devengado + (mes.devengado || 0),
      aporteJubilatorio: acc.aporteJubilatorio + (mes.aporteJubilatorio || 0),
      aportesPersonales: acc.aportesPersonales + (mes.aportesPersonales || 0),
    }),
    { objetoGasto: 0, presupuestado: 0, devengado: 0, aporteJubilatorio: 0, aportesPersonales: 0 }
  );

  const handleEliminarConfirm = async () => {
    if (!mesAEliminar) return;
    setEliminando(true);
    onEliminarMes(mesAEliminar.anio, mesAEliminar.mes);
    setMesAEliminar(null);
    setEliminando(false);
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

  if (anios.length === 0) {
    return (
      <div className="alert alert-info mb-0">
        <i className="bi bi-info-circle me-2"></i>
        No hay datos mensuales registrados.
        {!disabled && (
          <button
            onClick={onAgregarMes}
            className="btn btn-sm btn-primary ms-3"
          >
            <i className="bi bi-plus-lg me-1"></i>
            Agregar primer mes
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Header con selector de año y botón agregar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <label className="form-label mb-0 fw-medium">Año:</label>
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
          >
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
          <span className="badge bg-secondary">
            {mesesOrdenados.length} {mesesOrdenados.length === 1 ? 'mes' : 'meses'}
          </span>
        </div>
        {!disabled && (
          <button
            onClick={onAgregarMes}
            className="btn btn-sm btn-primary"
          >
            <i className="bi bi-plus-lg me-1"></i>
            Agregar mes
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-sm table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="text-nowrap">Mes</th>
              <th className="text-nowrap">Línea</th>
              <th className="text-nowrap">Categoría</th>
              <th className="text-end text-nowrap">Objeto Gasto</th>
              <th className="text-end text-nowrap">Presupuestado</th>
              <th className="text-end text-nowrap">Devengado</th>
              <th className="text-end text-nowrap d-none d-md-table-cell">Aporte Jub.</th>
              <th className="text-end text-nowrap d-none d-lg-table-cell">Aporte Pers.</th>
              <th className="text-end text-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesesOrdenados.map(([mesNum, mesData]) => (
              <tr key={mesNum}>
                <td className="fw-medium">{MESES_NOMBRES[parseInt(mesNum) - 1]}</td>
                <td>
                  <div className="d-flex flex-column">
                    <span className="fw-medium">{mesData.codigoLinea}</span>
                    <small className="text-muted text-truncate" style={{ maxWidth: '200px' }}>
                      {mesData.descripcionLinea}
                    </small>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <span className="fw-medium">{mesData.codigoCategoria}</span>
                    <small className="text-muted">{mesData.descripcionCategoria}</small>
                  </div>
                </td>
                <td className="text-end">{mesData.objetoGasto || '-'}</td>
                <td className="text-end">{formatCurrency(mesData.presupuestado)}</td>
                <td className="text-end">{formatCurrency(mesData.devengado)}</td>
                <td className="text-end d-none d-md-table-cell">
                  {formatCurrency(mesData.aporteJubilatorio || 0)}
                </td>
                <td className="text-end d-none d-lg-table-cell">
                  {formatCurrency(mesData.aportesPersonales || 0)}
                </td>
                <td className="text-end">
                  {!disabled && (
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          onEditarMes(parseInt(anioSeleccionado), parseInt(mesNum), mesData)
                        }
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() =>
                          setMesAEliminar({ anio: parseInt(anioSeleccionado), mes: parseInt(mesNum) })
                        }
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-light">
            <tr>
              <td colSpan={3}><strong>TOTALES {anioSeleccionado}</strong></td>
              <td></td>
              <td className="text-end"><strong>{formatCurrency(totales.presupuestado)}</strong></td>
              <td className="text-end"><strong>{formatCurrency(totales.devengado)}</strong></td>
              <td className="text-end d-none d-md-table-cell">
                <strong>{formatCurrency(totales.aporteJubilatorio)}</strong>
              </td>
              <td className="text-end d-none d-lg-table-cell">
                <strong>{formatCurrency(totales.aportesPersonales)}</strong>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notas adicionales si existen */}
      {mesesOrdenados.some(([_, mes]) => mes.observaciones || mes.objetoGasto) && (
        <div className="mt-3 p-3 bg-light rounded">
          <h6 className="fw-bold mb-2">Notas adicionales:</h6>
          <div className="small">
            {mesesOrdenados
              .filter(([_, mes]) => mes.observaciones || mes.objetoGasto)
              .map(([mesNum, mes]) => (
                <div key={mesNum} className="mb-1">
                  <strong>{MESES_NOMBRES[parseInt(mesNum) - 1]}:</strong>
                  {mes.objetoGasto && (
                    <span className="ms-2 text-muted">Objeto: {mes.objetoGasto}</span>
                  )}
                  {mes.observaciones && (
                    <span className="ms-2">{mes.observaciones}</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

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
