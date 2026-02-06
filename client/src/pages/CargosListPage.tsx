import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastContainer';
import { useDebounce } from '../hooks/useDebounce';
import cargosService from '../services/cargos.service';
import type { Cargo } from '../services/cargos.service';

export default function CargosListPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [filteredCargos, setFilteredCargos] = useState<Cargo[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Debounce search con 300ms de delay
  const debouncedSearch = useDebounce(search, 300);
  const isSearching = search !== debouncedSearch;

  const loadCargos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await cargosService.getAll();
      setCargos(data);
      setFilteredCargos(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cargar cargos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCargos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!debouncedSearch) {
      setFilteredCargos(cargos);
      return;
    }

    const searchLower = debouncedSearch.toLowerCase();
    const filtered = cargos.filter(
      (cargo) =>
        cargo.nombreCargo.toLowerCase().includes(searchLower) ||
        cargo.descripcion?.toLowerCase().includes(searchLower) ||
        cargo.nivel?.toLowerCase().includes(searchLower)
    );
    setFilteredCargos(filtered);
  }, [debouncedSearch, cargos]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await cargosService.delete(deleteId);
      toast.success('Cargo eliminado exitosamente');
      setDeleteId(null);
      await loadCargos();
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al eliminar cargo');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="row mb-3 mb-md-4">
        <div className="col-12 col-md mb-3 mb-md-0">
          <h2 className="mb-0 fs-3 fs-md-2">
            <i className="bi bi-briefcase-fill text-primary me-2"></i>
            <span className="d-none d-sm-inline">Gestión de </span>Cargos
          </h2>
          <p className="text-muted mb-0 small">Total: {filteredCargos.length} cargos</p>
        </div>
        <div className="col-12 col-md-auto">
          <Link to="/cargos/nuevo" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Cargo
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
                  placeholder="Buscar por nombre, descripción o nivel..."
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
                  {isSearching ? 'Buscando...' : `${filteredCargos.length} resultados encontrados`}
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
            <ErrorAlert error={error} onRetry={loadCargos} />
          ) : filteredCargos.length === 0 ? (
            <EmptyState
              icon="bi-briefcase"
              title="No hay cargos registrados"
              description={search ? 'No se encontraron resultados para tu búsqueda' : 'Comienza agregando el primer cargo'}
              action={
                !search && (
                  <Link to="/cargos/nuevo" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primer Cargo
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
                      <th>Nombre del Cargo</th>
                      <th>Nivel</th>
                      <th>Salario Base</th>
                      <th className="text-center">Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCargos.map((cargo) => (
                      <tr key={cargo.id}>
                        <td>
                          <div>
                            <strong>{cargo.nombreCargo}</strong>
                            {cargo.descripcion && (
                              <div className="text-muted small">{cargo.descripcion}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          {cargo.nivel ? (
                            <span className="badge bg-secondary">{cargo.nivel}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{formatCurrency(cargo.salarioBase)}</td>
                        <td className="text-center">
                          {cargo.activo ? (
                            <span className="badge bg-success">Activo</span>
                          ) : (
                            <span className="badge bg-secondary">Inactivo</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/cargos/${cargo.id}/editar`}
                              className="btn btn-outline-secondary"
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => setDeleteId(cargo.id)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cargo"
        message="¿Está seguro de que desea eliminar este cargo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
