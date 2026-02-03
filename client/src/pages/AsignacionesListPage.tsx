import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAsignaciones } from '../hooks/useAsignacionesPresupuestarias';

export default function AsignacionesListPage() {
  const { data, isLoading, error } = useAsignaciones();

  // Debug logs
  console.log('AsignacionesListPage - data:', data);
  console.log('AsignacionesListPage - isLoading:', isLoading);
  console.log('AsignacionesListPage - error:', error);
  if (data && data.length > 0) {
    console.log('AsignacionesListPage - primer objeto completo:', data[0]);
  }
  //console.table("Detail", data?.data || []);

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
              Error al cargar asignaciones: {error.message || 'Error desconocido'}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Línea</th>
                      <th>Salario Base</th>
                      <th>Estado</th>
                      <th>Personas Asignadas</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          No se encontraron asignaciones presupuestarias
                        </td>
                      </tr>
                    ) : (
                      data.map((asignacion) => (
                        <tr key={asignacion.id}>
                          <td>
                            <code className="text-primary">{asignacion.codigo || '-'}</code>
                          </td>
                          <td>
                            {asignacion.descripcion || '-'}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {asignacion.categoriaPresupuestaria?.codigoCategoria || '-'}
                            </span>
                          </td>
                          <td>
                            {asignacion.lineaPresupuestaria?.codigoLinea || '-'}
                          </td>
                          <td>
                            <strong>
                              {asignacion.salarioBase != null
                                ? new Intl.NumberFormat('es-PY', {
                                    style: 'currency',
                                    currency: 'PYG',
                                  }).format(Number(asignacion.salarioBase))
                                : '-'}
                            </strong>
                          </td>
                          <td>
                            <span className={`badge ${asignacion.vigente ? 'bg-success' : 'bg-secondary'}`}>
                              {asignacion.vigente ? 'Vigente' : 'No Vigente'}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info">
                              {asignacion._count?.asignacionesNombramientos || 0} persona(s)
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/asignaciones/${asignacion.id}/editar`}
                                className="btn btn-outline-secondary"
                                title="Editar asignación"
                              >
                                <i className="bi bi-pencil"></i>
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
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
