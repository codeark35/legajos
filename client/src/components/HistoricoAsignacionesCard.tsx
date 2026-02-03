import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistoricoAsignaciones } from '../hooks/useNombramientoAsignaciones';
import type { PeriodoAsignacion } from '../types';

interface Props {
  nombramientoId: string;
}

export default function HistoricoAsignacionesCard({ nombramientoId }: Props) {
  const navigate = useNavigate();
  const { periodos, loading, error } = useHistoricoAsignaciones(nombramientoId);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-PY');
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error al cargar histórico de asignaciones
          </div>
        </div>
      </div>
    );
  }

  if (!periodos || periodos.length === 0) {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-clock-history text-primary me-2"></i>
            Histórico de Plazas Presupuestarias
          </h5>
          <button
            onClick={() => navigate(`/nombramientos/${nombramientoId}/asignar-plaza`)}
            className="btn btn-sm btn-primary"
          >
            <i className="bi bi-plus-circle me-1"></i>
            Asignar Plaza
          </button>
        </div>
        <div className="card-body">
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4 d-block mb-3"></i>
            <p className="mb-0">No hay plazas presupuestarias asignadas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-clock-history text-primary me-2"></i>
          Histórico de Plazas Presupuestarias
        </h5>
        <button
          onClick={() => navigate(`/nombramientos/${nombramientoId}/asignar-plaza`)}
          className="btn btn-sm btn-primary"
        >
          <i className="bi bi-plus-circle me-1"></i>
          Asignar Plaza
        </button>
      </div>
      <div className="card-body">
        <div className="accordion" id={`accordion-${nombramientoId}`}>
          {periodos.slice(0, expanded ? undefined : 3).map((periodo, index) => {
            const isActive = !periodo.fechaFin || new Date(periodo.fechaFin) > new Date();
            
            return (
              <div key={index} className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${nombramientoId}-${index}`}
                  >
                    <div className="d-flex justify-content-between w-100 pe-3">
                      <div>
                        <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'} me-2`}>
                          {isActive ? 'Vigente' : 'Finalizada'}
                        </span>
                        <strong>{periodo.codigo || 'Sin código'}</strong>
                        {periodo.descripcion && (
                          <span className="text-muted ms-2">- {periodo.descripcion}</span>
                        )}
                      </div>
                      <div className="text-muted small">
                        {formatDate(periodo.fechaInicio)}
                        {periodo.fechaFin && ` - ${formatDate(periodo.fechaFin)}`}
                      </div>
                    </div>
                  </button>
                </h2>
                <div
                  id={`collapse-${nombramientoId}-${index}`}
                  className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                  data-bs-parent={`#accordion-${nombramientoId}`}
                >
                  <div className="accordion-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Categoría:</strong>{' '}
                          {periodo.categoria || 'N/A'}
                          {periodo.categoriaDescripcion && (
                            <span className="text-muted"> - {periodo.categoriaDescripcion}</span>
                          )}
                        </p>
                        <p className="mb-2">
                          <strong>Línea:</strong>{' '}
                          {periodo.linea || 'N/A'}
                          {periodo.lineaDescripcion && (
                            <span className="text-muted"> - {periodo.lineaDescripcion}</span>
                          )}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Salario Base:</strong>{' '}
                          ₲ {formatCurrency(periodo.salarioBase)} {periodo.moneda}
                        </p>
                        <p className="mb-2">
                          <strong>Período:</strong>{' '}
                          {formatDate(periodo.fechaInicio)}
                          {periodo.fechaFin ? ` al ${formatDate(periodo.fechaFin)}` : ' (Vigente)'}
                        </p>
                      </div>
                    </div>

                    {/* Mostrar resumen de histórico mensual */}
                    {periodo.historicoMensual && Object.keys(periodo.historicoMensual).length > 0 && (
                      <div className="mt-3">
                        <h6 className="border-bottom pb-2">Datos Mensuales Cargados</h6>
                        <div className="small">
                          <span className="badge bg-info text-dark me-2">
                            {Object.keys(periodo.historicoMensual).length} meses registrados
                          </span>
                          <button
                            onClick={() => navigate(`/nombramiento-asignaciones/${periodo.asignacionId}/historico`)}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Gestionar Datos Mensuales
                          </button>
                        </div>
                      </div>
                    )}

                    {(!periodo.historicoMensual || Object.keys(periodo.historicoMensual).length === 0) && (
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/nombramiento-asignaciones/${periodo.asignacionId}/historico`)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Cargar Datos Mensuales
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {periodos.length > 3 && (
          <div className="text-center mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-sm btn-outline-secondary"
            >
              {expanded ? (
                <>
                  <i className="bi bi-chevron-up me-1"></i>
                  Ver menos
                </>
              ) : (
                <>
                  <i className="bi bi-chevron-down me-1"></i>
                  Ver todos ({periodos.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
