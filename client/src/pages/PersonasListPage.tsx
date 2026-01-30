import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { personasService } from '../services/personas.service';
import type { Persona } from '../types';

export default function PersonasListPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadPersonas();
  }, [page, search]);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const response = await personasService.getAll({ page, limit: 10, search });
      setPersonas(response.data);
      setTotal(response.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar personas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-people-fill me-2"></i>
            Gestión de Personas
          </h2>
          <p className="text-muted">Total: {total} personas</p>
        </div>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/personas/new')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Persona
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, apellido o cédula..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : personas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">No se encontraron personas</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Cédula</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map((persona) => (
                    <tr key={persona.id}>
                      <td>{persona.numeroCedula}</td>
                      <td>{persona.nombres}</td>
                      <td>{persona.apellidos}</td>
                      <td>{persona.email || '-'}</td>
                      <td>{persona.telefono || '-'}</td>
                      <td>
                        <span
                          className={`badge ${
                            persona.estado === 'ACTIVO'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                        >
                          {persona.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => navigate(`/personas/${persona.id}`)}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => navigate(`/personas/${persona.id}/edit`)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => navigate(`/legajos/new?personaId=${persona.id}`)}
                          title="Crear legajo"
                        >
                          <i className="bi bi-folder-plus"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {total > 10 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">
                      Página {page} de {Math.ceil(total / 10)}
                    </span>
                  </li>
                  <li
                    className={`page-item ${
                      page >= Math.ceil(total / 10) ? 'disabled' : ''
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / 10)}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
