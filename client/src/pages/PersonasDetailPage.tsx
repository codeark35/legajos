import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { usePersona } from '../hooks/usePersonas';

export default function PersonasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePersona(id!);

  const persona = data?.data;

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="bi bi-person text-primary me-2"></i>
              Detalle de Persona
            </h2>
            <div>
              <Link to="/personas" className="btn btn-outline-secondary me-2">
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </Link>
              <Link to={`/personas/${id}/editar`} className="btn btn-primary">
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
          Error al cargar persona: {(error as any).message}
        </div>
      ) : persona ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información Personal
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small">Nombres</label>
                    <p className="fw-bold">{persona.nombres}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Apellidos</label>
                    <p className="fw-bold">{persona.apellidos}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Número de Cédula</label>
                    <p className="fw-bold">{persona.numeroCedula}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Fecha de Nacimiento</label>
                    <p className="fw-bold">
                      {persona.fechaNacimiento
                        ? new Date(persona.fechaNacimiento).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small">Dirección</label>
                    <p className="fw-bold">{persona.direccion || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-telephone me-2"></i>
                  Información de Contacto
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small">Email</label>
                    <p className="fw-bold">{persona.email || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Teléfono</label>
                    <p className="fw-bold">{persona.telefono || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Estado</label>
                    <p>
                      <span
                        className={`badge ${
                          persona.estado === 'ACTIVO'
                            ? 'bg-success'
                            : persona.estado === 'INACTIVO'
                            ? 'bg-secondary'
                            : 'bg-warning'
                        }`}
                      >
                        {persona.estado}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Historial
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="text-muted small">Fecha de Creación</label>
                  <p className="fw-bold">
                    {new Date(persona.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="text-muted small">Última Actualización</label>
                  <p className="fw-bold">
                    {new Date(persona.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            {persona.legajos && persona.legajos.length > 0 && (
              <div className="card mt-3">
                <div className="card-header bg-warning">
                  <h5 className="mb-0">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Legajos Asociados
                  </h5>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {persona.legajos.map((legajo: any) => (
                      <Link
                        key={legajo.id}
                        to={`/legajos/${legajo.id}`}
                        className="list-group-item list-group-item-action"
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{legajo.numeroLegajo}</h6>
                          <small
                            className={`badge ${
                              legajo.estadoLegajo === 'ACTIVO'
                                ? 'bg-success'
                                : 'bg-secondary'
                            }`}
                          >
                            {legajo.estadoLegajo}
                          </small>
                        </div>
                        <small className="text-muted">{legajo.tipoLegajo}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">Persona no encontrada</div>
      )}
    </Layout>
  );
}
