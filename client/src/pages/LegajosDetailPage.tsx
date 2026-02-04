import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLegajo } from '../hooks/useLegajos';

interface Nombramiento {
  id: string;
  estadoNombramiento: string;
  cargo?: { 
    id: string;
    nombreCargo: string;
  };
  tipoNombramiento: string;
  categoria: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  salarioBase: number | null;
  vigente: boolean;
}


export default function LegajosDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: legajo, isLoading, error } = useLegajo(id!);

  const handleVerHistorico = (nombramientoId: string) => {
    navigate(`/nombramientos/${nombramientoId}/historico`);
  };


  // Verificar si tenemos un ID válido
  if (!id) {
    return (
      <Layout>
        <div className="alert alert-danger">
          ID de legajo no proporcionado
        </div>
      </Layout>
    );
  }

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
          <p className="mt-3 text-muted">Cargando información del legajo...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <h5 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error al cargar legajo
          </h5>
          <p className="mb-0">
            {error instanceof Error ? error.message : 'No se pudo cargar la información del legajo. Por favor, intente nuevamente.'}
          </p>
          <hr />
          <Link to="/legajos" className="btn btn-sm btn-outline-danger">
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la lista
          </Link>
        </div>
      ) : !legajo ? (
        <div className="alert alert-warning">
          <h5 className="alert-heading">
            <i className="bi bi-info-circle me-2"></i>
            Legajo no encontrado
          </h5>
          <p className="mb-0">
            No se encontró información para el legajo solicitado.
          </p>
          <hr />
          <Link to="/legajos" className="btn btn-sm btn-outline-warning">
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la lista
          </Link>
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
                      {legajo.fechaApertura 
                        ? new Date(legajo.fechaApertura).toLocaleDateString('es-ES')
                        : '-'
                      }
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

            {legajo.nombramientos && legajo.nombramientos.length > 0 ? (
              <>
                <div className="card mb-4">
                  <div className="card-header bg-warning d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-briefcase me-2"></i>
                      Nombramientos ({legajo.nombramientos.length})
                    </h5>
                    <button
                      onClick={() => navigate(`/nombramientos/nuevo?legajoId=${legajo.id}`)}
                      className="btn btn-sm btn-light"
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Agregar Nombramiento
                    </button>
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
                            <th className="text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {legajo.nombramientos.map((nom: Nombramiento) => {
                            // Calcular si está realmente vigente
                            const ahora = new Date();
                            const fechaInicio = new Date(nom.fechaInicio);
                            const fechaFin = nom.fechaFin ? new Date(nom.fechaFin) : null;
                            const esVigente = nom.vigente && 
                                            fechaInicio <= ahora && 
                                            (!fechaFin || fechaFin >= ahora);
                            
                            // Determinar estado real
                            let estadoReal = nom.estadoNombramiento;
                            if (!esVigente && fechaFin && fechaFin < ahora) {
                              estadoReal = 'FINALIZADO';
                            } else if (fechaInicio > ahora) {
                              estadoReal = 'PENDIENTE';
                            }
                            
                            return (
                            <tr key={nom.id}>
                              <td>{nom.cargo?.nombreCargo || nom.tipoNombramiento}</td>
                              <td>
                                <span className="badge bg-secondary">{nom.categoria || '-'}</span>
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
                                    esVigente
                                      ? 'bg-success'
                                      : estadoReal === 'FINALIZADO'
                                      ? 'bg-secondary'
                                      : estadoReal === 'PENDIENTE'
                                      ? 'bg-info'
                                      : 'bg-warning'
                                  }`}
                                >
                                  {esVigente ? 'VIGENTE' : estadoReal || 'FINALIZADO'}
                                </span>
                              </td>
                              <td>
                                {nom.salarioBase ? new Intl.NumberFormat('es-PY', {
                                  style: 'currency',
                                  currency: 'PYG',
                                }).format(nom.salarioBase) : '-'}
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => handleVerHistorico(nom.id)}
                                    title="Ver Histórico Mensual"
                                  >
                                    <i className="bi bi-calendar3"></i> Histórico
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-warning"
                                    onClick={() => navigate(`/nombramientos/${nom.id}/editar`)}
                                    title="Editar Nombramiento"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  {esVigente && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger"
                                      onClick={() => navigate(`/nombramientos/${nom.id}/finalizar`)}
                                      title="Finalizar Nombramiento"
                                    >
                                      <i className="bi bi-x-circle"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card mb-4">
                <div className="card-header bg-warning">
                  <h5 className="mb-0">
                    <i className="bi bi-briefcase me-2"></i>
                    Nombramientos
                  </h5>
                </div>
                <div className="card-body text-center py-5">
                  <i className="bi bi-briefcase display-1 text-muted mb-3"></i>
                  <p className="text-muted mb-3">
                    No hay nombramientos registrados para este legajo.
                  </p>
                  <button
                    onClick={() => navigate(`/nombramientos/nuevo?legajoId=${legajo.id}`)}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primer Nombramiento
                  </button>
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
                    {legajo.createdAt 
                      ? new Date(legajo.createdAt).toLocaleString('es-ES')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-muted small">Última Modificación</label>
                  <p className="mb-0">
                    {legajo.updatedAt 
                      ? new Date(legajo.updatedAt).toLocaleString('es-ES')
                      : '-'
                    }
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
      ) : null}
    </Layout>
  );
}
