import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLegajo } from '../hooks/useLegajos';

export default function LegajosDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useLegajo(id!);

  const legajo = data?.data;

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="bi bi-file-earmark-text text-primary me-2"></i>
              Detalle de Legajo
            </h2>
            <div>
              <Link to="/legajos" className="btn btn-outline-secondary me-2">
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </Link>
              <Link to={`/legajos/${id}/editar`} className="btn btn-primary">
                <i className="bi bi-pencil me-2"></i>
                Editar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          Error al cargar legajo: {(error as any).message}
        </div>
      ) : legajo ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información del Legajo
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small">Número de Legajo</label>
                    <p className="fw-bold fs-4 text-primary">{legajo.numeroLegajo}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Estado</label>
                    <p>
                      <span
                        className={`badge ${
                          legajo.estadoLegajo === 'ACTIVO'
                            ? 'bg-success'
                            : legajo.estadoLegajo === 'CERRADO'
                            ? 'bg-secondary'
                            : legajo.estadoLegajo === 'SUSPENDIDO'
                            ? 'bg-warning'
                            : 'bg-info'
                        }`}
                      >
                        {legajo.estadoLegajo}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Tipo de Legajo</label>
                    <p className="fw-bold">{legajo.tipoLegajo}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Fecha de Apertura</label>
                    <p className="fw-bold">
                      {new Date(legajo.fechaApertura).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {legajo.facultad && (
                    <div className="col-12">
                      <label className="text-muted small">Facultad</label>
                      <p className="fw-bold">{legajo.facultad.nombreFacultad}</p>
                    </div>
                  )}
                  {legajo.observaciones && (
                    <div className="col-12">
                      <label className="text-muted small">Observaciones</label>
                      <p className="fw-bold">{legajo.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {legajo.persona && (
              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-person me-2"></i>
                    Datos de la Persona
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="text-muted small">Nombre Completo</label>
                      <p className="fw-bold">
                        {legajo.persona.nombres} {legajo.persona.apellidos}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small">Cédula</label>
                      <p className="fw-bold">{legajo.persona.numeroCedula}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small">Email</label>
                      <p className="fw-bold">{legajo.persona.email || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small">Teléfono</label>
                      <p className="fw-bold">{legajo.persona.telefono || '-'}</p>
                    </div>
                    <div className="col-12">
                      <Link
                        to={`/personas/${legajo.persona.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-eye me-2"></i>
                        Ver Detalle de Persona
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {legajo.nombramientos && legajo.nombramientos.length > 0 && (
              <div className="card">
                <div className="card-header bg-warning">
                  <h5 className="mb-0">
                    <i className="bi bi-briefcase me-2"></i>
                    Nombramientos ({legajo.nombramientos.length})
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Cargo</th>
                          <th>Categoría</th>
                          <th>Fecha Inicio</th>
                          <th>Fecha Fin</th>
                          <th>Estado</th>
                          <th>Salario Base</th>
                        </tr>
                      </thead>
                      <tbody>
                        {legajo.nombramientos.map((nom: any) => (
                          <tr key={nom.id}>
                            <td>{nom.cargo?.nombreCargo || nom.tipoNombramiento}</td>
                            <td>
                              <span className="badge bg-secondary">{nom.categoria}</span>
                            </td>
                            <td>
                              {new Date(nom.fechaInicio).toLocaleDateString('es-ES')}
                            </td>
                            <td>
                              {nom.fechaFin
                                ? new Date(nom.fechaFin).toLocaleDateString('es-ES')
                                : 'Vigente'}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  nom.estadoNombramiento === 'VIGENTE'
                                    ? 'bg-success'
                                    : nom.estadoNombramiento === 'FINALIZADO'
                                    ? 'bg-secondary'
                                    : 'bg-warning'
                                }`}
                              >
                                {nom.estadoNombramiento}
                              </span>
                            </td>
                            <td>
                              {new Intl.NumberFormat('es-PY', {
                                style: 'currency',
                                currency: 'PYG',
                              }).format(nom.salarioBase)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Auditoría
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="text-muted small">Creado</label>
                  <p className="mb-0">
                    {new Date(legajo.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="text-muted small">Última Modificación</label>
                  <p className="mb-0">
                    {new Date(legajo.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            {legajo._count && (
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Resumen
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="text-muted small">Nombramientos</label>
                    <p className="fs-4 fw-bold text-success mb-0">
                      {legajo._count.nombramientos || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted small">Documentos</label>
                    <p className="fs-4 fw-bold text-primary mb-0">
                      {legajo._count.documentos || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">Legajo no encontrado</div>
      )}
    </Layout>
  );
}
