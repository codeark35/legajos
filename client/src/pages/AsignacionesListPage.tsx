import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAsignaciones } from '../hooks/useAsignacionesPresupuestarias';

export default function AsignacionesListPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useAsignaciones({ page, limit });

  return (
    <Layout>
      <div className="row mb-3 mb-md-4">
        <div className="col-12 col-md mb-3 mb-md-0">
          <h2 className="mb-0 fs-3 fs-md-2">
            <i className="bi bi-cash-coin text-primary me-2"></i>
            <span className="d-none d-sm-inline">Asignaciones </span>Presupuestarias
          </h2>
        </div>
        <div className="col-12 col-md-auto">
          <Link to="/asignaciones/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Asignación
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              Error al cargar asignaciones: {(error as any).message}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombramiento</th>
                      <th>Categoría</th>
                      <th>Línea</th>
                      <th>Monto Base</th>
                      <th>Fecha Inicio</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No se encontraron asignaciones presupuestarias
                        </td>
                      </tr>
                    ) : (
                      data?.data?.data?.map((asignacion: any) => (
                        <tr key={asignacion.id}>
                          <td>
                            {asignacion.nombramiento?.cargo?.nombre || '-'}
                          </td>
                          <td>
                            {asignacion.categoriaPresupuestaria?.codigoCategoria || '-'}
                          </td>
                          <td>
                            {asignacion.lineaPresupuestaria?.codigoLinea || '-'}
                          </td>
                          <td>
                            <strong>
                              {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                              }).format(asignacion.montoBase)}
                            </strong>
                          </td>
                          <td>
                            {new Date(asignacion.fechaInicio).toLocaleDateString('es-ES')}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                asignacion.fechaFin
                                  ? 'bg-secondary'
                                  : 'bg-success'
                              }`}
                            >
                              {asignacion.fechaFin ? 'Finalizada' : 'Vigente'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/asignaciones/${asignacion.id}`}
                                className="btn btn-outline-primary"
                                title="Ver histórico mensual"
                              >
                                <i className="bi bi-calendar3"></i>
                              </Link>
                              <Link
                                to={`/asignaciones/${asignacion.id}/auditoria`}
                                className="btn btn-outline-info"
                                title="Ver auditoría"
                              >
                                <i className="bi bi-clock-history"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {data?.data?.pagination && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Mostrando {data.data.pagination.page} de {data.data.pagination.totalPages} páginas
                    ({data.data.pagination.total} registros totales)
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${data.data.pagination.page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(page - 1)}
                          disabled={data.data.pagination.page === 1}
                        >
                          Anterior
                        </button>
                      </li>
                      <li className="page-item active">
                        <span className="page-link">{data.data.pagination.page}</span>
                      </li>
                      <li className={`page-item ${data.data.pagination.page >= data.data.pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(page + 1)}
                          disabled={data.data.pagination.page >= data.data.pagination.totalPages}
                        >
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
