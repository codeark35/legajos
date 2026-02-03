import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import FuncionarioAccordion from '../components/FuncionarioAccordion';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import { useDebounce } from '../hooks/useDebounce';
import apiService from '../services/api.service';

interface Funcionario {
  id: string;
  legajoId: string;
  numeroLegajo: string;
  nombreCompleto: string;
  nombres: string;
  apellidos: string;
  numeroCedula: string;
  estado: string;
  estadoLegajo: string;
  facultad: string | null;
  cargo: string | null;
  fechaIngreso: string;
  nombramientoId: string | null;
  salarioBase: number | null;
  moneda: string;
}

export default function GestionLegajosPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const limit = 50;

  // Debounce search con 300ms de delay
  const debouncedSearch = useDebounce(search, 300);
  const isSearching = search !== debouncedSearch;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['funcionarios-completo', debouncedSearch, page, limit],
    queryFn: async () => {
      const { data } = await apiService.get('/legajos/funcionarios-completo', {
        params: {
          search: debouncedSearch,
          page,
          limit,
          estadoLegajo: 'ACTIVO',
        },
      });
      return data;
    },
  });

  const funcionarios: Funcionario[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleToggle = (funcionarioId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(funcionarioId)) {
        newSet.delete(funcionarioId);
      } else {
        newSet.add(funcionarioId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(funcionarios.map((f) => f.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <Layout>
      <div className="row mb-3 mb-md-4">
        <div className="col-12 col-md mb-3 mb-md-0">
          <h2 className="mb-0 fs-3 fs-md-2">
            <i className="bi bi-file-earmark-text text-primary me-2"></i>
            <span className="d-none d-sm-inline">Gestión de </span>Legajos
          </h2>
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-outline-secondary me-2" disabled>
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label htmlFor="search" className="form-label">
                Buscar funcionario
              </label>
              <div className="position-relative">
                <input
                  id="search"
                  type="text"
                  className="form-control"
                  placeholder="🔍 Buscar por legajo, nombre, apellido o CI..."
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
              {search && !isSearching && (
                <small className="text-muted">
                  {pagination?.total || 0} funcionario(s) encontrado(s)
                </small>
              )}
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm flex-grow-1"
                  onClick={handleExpandAll}
                  disabled={funcionarios.length === 0}
                >
                  <i className="bi bi-arrows-expand me-1"></i>
                  Expandir Todos
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm flex-grow-1"
                  onClick={handleCollapseAll}
                  disabled={expandedIds.size === 0}
                >
                  <i className="bi bi-arrows-collapse me-1"></i>
                  Colapsar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total de funcionarios */}
      {!isLoading && pagination && (
        <div className="mb-3">
          <p className="text-muted mb-0">
            <i className="bi bi-people-fill me-2"></i>
            <strong>Total funcionarios:</strong> {pagination.total}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-body">
            <LoadingSkeleton />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorAlert
          error={error}
          onRetry={refetch}
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && funcionarios.length === 0 && (
        <EmptyState
          icon="bi-people"
          title={search ? 'No se encontraron funcionarios' : 'No hay funcionarios registrados'}
          description={
            search
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea un nuevo legajo para comenzar'
          }
        />
      )}

      {/* Accordion de Funcionarios */}
      {!isLoading && !error && funcionarios.length > 0 && (
        <div className="accordion" id="accordionFuncionarios">
          {funcionarios.map((funcionario) => (
            <FuncionarioAccordion
              key={funcionario.id}
              funcionario={funcionario}
              isOpen={expandedIds.has(funcionario.id)}
              onToggle={() => handleToggle(funcionario.id)}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {!isLoading && !error && pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Mostrar primera página, última página, página actual y 2 páginas alrededor
                  return (
                    p === 1 ||
                    p === pagination.totalPages ||
                    (p >= page - 2 && p <= page + 2)
                  );
                })
                .map((p, index, array) => {
                  // Agregar "..." entre páginas no consecutivas
                  const showEllipsis = index > 0 && p - array[index - 1] > 1;
                  return (
                    <span key={p}>
                      {showEllipsis && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      <li className={`page-item ${page === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(p)}>
                          {p}
                        </button>
                      </li>
                    </span>
                  );
                })}

              <li
                className={`page-item ${page === pagination.totalPages ? 'disabled' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </Layout>
  );
}
