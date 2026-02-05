import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/Layout";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorAlert from "../components/ErrorAlert";
import EmptyState from "../components/EmptyState";
import { useToast } from "../components/ToastContainer";
import lineasService from "../services/lineas.service";
import type { LineaPresupuestaria } from "../types";

export default function LineasPresupuestariasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingLinea, setEditingLinea] = useState<LineaPresupuestaria | null>(
    null,
  );
  const [filterVigente, setFilterVigente] = useState<
    "all" | "vigente" | "no-vigente"
  >("vigente");

  const [formData, setFormData] = useState({
    codigoLinea: "",
    descripcion: "",
    tipo: "",
    vigente: true,
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: lineas = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["lineas-presupuestarias", filterVigente],
    queryFn: () => {
      if (filterVigente === "all") return lineasService.getAll();
      if (filterVigente === "vigente") return lineasService.getAll(true);
      return lineasService.getAll(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: lineasService.create,
    onSuccess: () => {
      toast.success("Línea creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["lineas-presupuestarias"] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear línea");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<LineaPresupuestaria>;
    }) => lineasService.update(id, data),
    onSuccess: () => {
      toast.success("Línea actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["lineas-presupuestarias"] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar línea");
    },
  });

  const toggleVigenteMutation = useMutation({
    mutationFn: lineasService.toggleVigente,
    onSuccess: () => {
      toast.success("Estado actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["lineas-presupuestarias"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al cambiar estado");
    },
  });

  const handleOpenModal = (linea?: LineaPresupuestaria) => {
    if (linea) {
      setEditingLinea(linea);
      setFormData({
        codigoLinea: linea.codigoLinea,
        descripcion: linea.descripcion || "", // ✅ Agregado || ''
        tipo: linea.tipo || "", // ✅ Agregado
        vigente: linea.vigente,
      });
    } else {
      setEditingLinea(null);
      setFormData({
        codigoLinea: "",
        descripcion: "",
        tipo: "",
        vigente: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLinea(null);
    setFormData({
      codigoLinea: "",
      descripcion: "",
      tipo: "",
      vigente: true,
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLinea) {
      updateMutation.mutate({ id: editingLinea.id, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-1">
                  <i className="bi bi-list-ol me-2"></i>
                  Líneas Presupuestarias
                </h1>
                <p className="text-muted mb-0">
                  Gestión de líneas presupuestarias del sistema
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal()}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Nueva Línea
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={filterVigente}
                  onChange={(e) => setFilterVigente(e.target.value as any)}
                >
                  <option value="vigente">Solo Vigentes</option>
                  <option value="no-vigente">Solo No Vigentes</option>
                  <option value="all">Todas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          <div className="card-body">
            {isLoading ? (
              <LoadingSkeleton rows={5} columns={4} />
            ) : error ? (
              <ErrorAlert error={error} onRetry={refetch} />
            ) : lineas.length === 0 ? (
              <EmptyState
                icon="bi-list-ol"
                title="No hay líneas presupuestarias"
                description="Comienza agregando la primera línea presupuestaria"
                action={
                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenModal()}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Nueva Línea
                  </button>
                }
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th className="text-center">Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((linea) => (
                      <tr key={linea.id}>
                        <td>
                          <span className="fw-bold">{linea.codigoLinea}</span>
                        </td>
                        <td>{linea.descripcion}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              linea.vigente ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {linea.vigente ? "Vigente" : "No Vigente"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleOpenModal(linea)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className={`btn ${
                                linea.vigente
                                  ? "btn-outline-warning"
                                  : "btn-outline-success"
                              }`}
                              onClick={() =>
                                toggleVigenteMutation.mutate(linea.id)
                              }
                              title={
                                linea.vigente
                                  ? "Marcar como no vigente"
                                  : "Marcar como vigente"
                              }
                            >
                              <i
                                className={`bi ${linea.vigente ? "bi-x-circle" : "bi-check-circle"}`}
                              ></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingLinea ? "Editar Línea" : "Nueva Línea"} Presupuestaria
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Código *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.codigoLinea}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigoLinea: e.target.value,
                        })
                      }
                      required
                      placeholder="Ej: 110"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción *</label>
                    <textarea
                      className="form-control"
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcion: e.target.value,
                        })
                      }
                      required
                      rows={3}
                      placeholder="Descripción de la línea presupuestaria"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select
                      className="form-select"
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo: e.target.value })
                      }
                    >
                      <option value="">Seleccionar tipo...</option>
                      <option value="DOCENTE">Docente</option>
                      <option value="ADMINISTRATIVO">Administrativo</option>
                      <option value="TECNICO">Técnico</option>
                    </select>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="vigente"
                      checked={formData.vigente}
                      onChange={(e) =>
                        setFormData({ ...formData, vigente: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="vigente">
                      Vigente
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    {editingLinea ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
