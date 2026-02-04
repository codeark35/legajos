import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/ToastContainer";
import { useDebounce } from "../hooks/useDebounce";
import { useLegajos, useDeleteLegajo } from "../hooks/useLegajos";

export default function LegajosListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;
  const toast = useToast();

  // Debounce search con 300ms de delay
  const debouncedSearch = useDebounce(search, 300);
  const isSearching = search !== debouncedSearch;

  const { data, isLoading, error, refetch } = useLegajos({
    search: debouncedSearch,
    page,
    limit,
  });
  const deleteMutation = useDeleteLegajo();

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Legajo eliminado exitosamente");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al eliminar legajo");
      setDeleteId(null);
    }
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
          <Link to="/legajos/nuevo" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Legajo
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por número de legajo o persona..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {isSearching && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Buscando...</span>
                    </div>
                  </div>
                )}
              </div>
              {search && (
                <small className="text-muted">
                  {isSearching
                    ? "Buscando..."
                    : `${data?.data?.pagination?.total || 0} resultados encontrados`}
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <LoadingSkeleton rows={5} columns={6} />
          ) : error ? (
            <ErrorAlert error={error} onRetry={refetch} />
          ) : data?.data?.data?.length === 0 ? (
            <EmptyState
              icon="bi-folder2-open"
              title="No hay legajos registrados"
              description={
                search
                  ? "No se encontraron resultados para tu búsqueda"
                  : "Comienza agregando el primer legajo"
              }
              action={
                !search && (
                  <Link to="/legajos/nuevo" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primer Legajo
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
                      <th>Nº Legajo</th>
                      <th>Persona</th>
                      <th>Documento</th>
                      <th>Fecha Ingreso</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.data?.map((legajo: any) => (
                      <tr key={legajo.id}>
                          <td>
                        <Link
                          to={`/legajos/${legajo.id}`}
                          className="text-decoration-none text-dark fw-normal"
                        >
                            <strong>{legajo.numeroLegajo}</strong>
                        </Link>
                          </td>
                        <td>
                          <Link
                          to={`/legajos/${legajo.id}`}
                          className="text-decoration-none text-dark fw-normal"
                        >

                          {legajo.persona ? (
                            <>
                              {legajo.persona.nombres}{" "}
                              {legajo.persona.apellidos}
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                          </Link>
                        </td>
                        <td>{legajo.persona?.numeroCedula || "-"}</td>
                        <td>
                          {legajo.fechaApertura
                            ? new Date(legajo.fechaApertura).toLocaleDateString(
                                "es-ES",
                              )
                            : "-"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              legajo.estadoLegajo === "ACTIVO"
                                ? "bg-success"
                                : legajo.estadoLegajo === "CERRADO"
                                  ? "bg-secondary"
                                  : legajo.estadoLegajo === "SUSPENDIDO"
                                    ? "bg-warning"
                                    : "bg-info"
                            }`}
                          >
                            {legajo.estadoLegajo}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/legajos/${legajo.id}`}
                              className="btn btn-outline-primary"
                              title="Ver detalle"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                            <Link
                              to={`/legajos/${legajo.id}/editar`}
                              className="btn btn-outline-secondary"
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => setDeleteId(legajo.id)}
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

              {/* Paginación */}
              {data?.data?.pagination && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Mostrando {data.data.pagination.page} de{" "}
                    {data.data.pagination.totalPages} páginas (
                    {data.data.pagination.total} registros totales)
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li
                        className={`page-item ${data.data.pagination.page === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(page - 1)}
                          disabled={data.data.pagination.page === 1}
                        >
                          Anterior
                        </button>
                      </li>
                      <li className="page-item active">
                        <span className="page-link">
                          {data.data.pagination.page}
                        </span>
                      </li>
                      <li
                        className={`page-item ${data.data.pagination.page >= data.data.pagination.totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(page + 1)}
                          disabled={
                            data.data.pagination.page >=
                            data.data.pagination.totalPages
                          }
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
        title="Eliminar Legajo"
        message="¿Está seguro de que desea eliminar este legajo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}
