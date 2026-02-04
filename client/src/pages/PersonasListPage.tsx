import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastContainer';
import { useDebounce } from '../hooks/useDebounce';
import { usePersonas, useDeletePersona } from '../hooks/usePersonas';

export default function PersonasListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;
  const toast = useToast();

  // Debounce search con 300ms de delay
  const debouncedSearch = useDebounce(search, 300);
  const isSearching = search !== debouncedSearch;

  const { data, isLoading, error, refetch } = usePersonas({ search: debouncedSearch, page, limit });
  const deleteMutation = useDeletePersona();

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Persona eliminada exitosamente');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar persona');
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="row mb-3 mb-md-4">
        <div className="col-12 col-md mb-3 mb-md-0">
          <h2 className="mb-0 fs-3 fs-md-2">
            <i className="bi bi-people-fill text-primary me-2"></i>
            <span className="d-none d-sm-inline">Gestión de </span>Personas
          </h2>
          <p className="text-muted mb-0 small">Total: {data?.meta?.total || 0} personas</p>
        </div>
        <div className="col-12 col-md-auto">
          <Link to="/personas/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Persona
          </Link>
        </div>
      </div>

      <div className="card mb-3 mb-md-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {isSearching && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Buscando...</span>
                    </div>
                  </div>
                )}
              </div>
              {search && (
                <small className="text-muted">
                  {isSearching ? 'Buscando...' : `${data?.pagination?.total || 0} resultados encontrados`}
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <LoadingSkeleton rows={5} columns={5} />
          ) : error ? (
            <ErrorAlert error={error} onRetry={refetch} />
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              icon="bi-people"
              title="No hay personas registradas"
              description={search ? 'No se encontraron resultados para tu búsqueda' : 'Comienza agregando la primera persona'}
              action={
                !search && (
                  <Link to="/personas/nuevo" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primera Persona
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Documento</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(data?.data) || data.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No se encontraron personas
                        </td>
                      </tr>
                    ) : (
                      data.data.map((persona: any) => (
                        <tr key={persona.id}>
                          <td>{persona.nombres}</td>
                          <td>{persona.apellidos}</td>
                          <td>{persona.numeroCedula}</td>
                          <td>{persona.email || '-'}</td>
                          <td>{persona.telefono || '-'}</td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/personas/${persona.id}`}
                                className="btn btn-outline-primary"
                                title="Ver detalle"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                to={`/personas/${persona.id}/editar`}
                                className="btn btn-outline-secondary"
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                className="btn btn-outline-danger"
                              onClick={() => setDeleteId(persona.id)}
                                title="Eliminar"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Mostrando {data.pagination.page} de {data.pagination.totalPages} páginas
                    ({data.pagination.total} registros totales)
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${data.pagination.page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(page - 1)}
                          disabled={data.pagination.page === 1}
                        >
                          Anterior
                        </button>
                      </li>
                      <li className="page-item active">
                        <span className="page-link">{data.pagination.page}</span>
                      </li>
                      <li className={`page-item ${data.pagination.page >= data.pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(page + 1)}
                          disabled={data.pagination.page >= data.pagination.totalPages}
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

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Persona"
        message="¿Está seguro de que desea eliminar esta persona? Esta acción no se puede deshacer y también eliminará todos los legajos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}
