import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/ToastContainer';
import categoriasService from '../services/categorias.service';
import type { CategoriaPresupuestaria } from '../types';

export default function CategoriasPresupuestariasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaPresupuestaria | null>(null);
  const [filterVigente, setFilterVigente] = useState<'all' | 'vigente' | 'no-vigente'>('vigente');
  
  const [formData, setFormData] = useState({
    codigoCategoria: '',
    descripcion: '',
    tipo: '',
    escalaSalarial: '',
    rangoSalarialMin: '',
    rangoSalarialMax: '',
    vigente: true,
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categorias-presupuestarias', filterVigente],
    queryFn: () => {
      if (filterVigente === 'all') return categoriasService.getAll();
      if (filterVigente === 'vigente') return categoriasService.getAll(true);
      return categoriasService.getAll(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: categoriasService.create,
    onSuccess: () => {
      toast.success('Categoría creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['categorias-presupuestarias'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoriaPresupuestaria> }) =>
      categoriasService.update(id, data),
    onSuccess: () => {
      toast.success('Categoría actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['categorias-presupuestarias'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    },
  });

  const toggleVigenteMutation = useMutation({
    mutationFn: categoriasService.toggleVigente,
    onSuccess: () => {
      toast.success('Estado actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['categorias-presupuestarias'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    },
  });

  const handleOpenModal = (categoria?: CategoriaPresupuestaria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        codigoCategoria: categoria.codigoCategoria,
        descripcion: categoria.descripcion,
        tipo: categoria.tipo || '',
        escalaSalarial: categoria.escalaSalarial || '',
        rangoSalarialMin: categoria.rangoSalarialMin?.toString() || '',
        rangoSalarialMax: categoria.rangoSalarialMax?.toString() || '',
        vigente: categoria.vigente,
      });
    } else {
      setEditingCategoria(null);
      setFormData({ 
        codigoCategoria: '', 
        descripcion: '', 
        tipo: '',
        escalaSalarial: '',
        rangoSalarialMin: '',
        rangoSalarialMax: '',
        vigente: true 
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({ 
      codigoCategoria: '', 
      descripcion: '', 
      tipo: '',
      escalaSalarial: '',
      rangoSalarialMin: '',
      rangoSalarialMax: '',
      vigente: true 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transformar los datos antes de enviar
    const dataToSend = {
      codigoCategoria: formData.codigoCategoria,
      descripcion: formData.descripcion,
      tipo: formData.tipo || undefined,
      escalaSalarial: formData.escalaSalarial || undefined,
      rangoSalarialMin: formData.rangoSalarialMin ? Number(formData.rangoSalarialMin) : undefined,
      rangoSalarialMax: formData.rangoSalarialMax ? Number(formData.rangoSalarialMax) : undefined,
      vigente: formData.vigente,
    };
    
    if (editingCategoria) {
      updateMutation.mutate({ id: editingCategoria.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend as any);
    }
  };

  // Formatear números con separador de miles
  const formatNumber = (num: number | undefined) => {
    if (!num) return '-';
    return new Intl.NumberFormat('es-PY').format(num);
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
                  <i className="bi bi-tags me-2"></i>
                  Categorías Presupuestarias
                </h1>
                <p className="text-muted mb-0">Gestión de categorías presupuestarias del sistema</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal()}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Nueva Categoría
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
              <LoadingSkeleton rows={5} columns={6} />
            ) : error ? (
              <ErrorAlert error={error} onRetry={refetch} />
            ) : categorias.length === 0 ? (
              <EmptyState
                icon="bi-tags"
                title="No hay categorías presupuestarias"
                description="Comienza agregando la primera categoría presupuestaria"
                action={
                  <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Nueva Categoría
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
                      <th>Tipo</th>
                      <th>Escala Salarial</th>
                      <th>Rango Salarial</th>
                      <th className="text-center">Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((categoria) => (
                      <tr key={categoria.id}>
                        <td>
                          <span className="fw-bold">{categoria.codigoCategoria}</span>
                        </td>
                        <td>{categoria.descripcion}</td>
                        <td>
                          {categoria.tipo ? (
                            <span className="badge bg-info">{categoria.tipo}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {categoria.escalaSalarial ? (
                            <span className="badge bg-secondary">{categoria.escalaSalarial}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {categoria.rangoSalarialMin || categoria.rangoSalarialMax ? (
                            <small className="text-muted">
                              ₲ {formatNumber(categoria.rangoSalarialMin)} - ₲ {formatNumber(categoria.rangoSalarialMax)}
                            </small>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              categoria.vigente ? 'bg-success' : 'bg-secondary'
                            }`}
                          >
                            {categoria.vigente ? 'Vigente' : 'No Vigente'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleOpenModal(categoria)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className={`btn ${
                                categoria.vigente ? 'btn-outline-warning' : 'btn-outline-success'
                              }`}
                              onClick={() => toggleVigenteMutation.mutate(categoria.id)}
                              title={categoria.vigente ? 'Marcar como no vigente' : 'Marcar como vigente'}
                            >
                              <i className={`bi ${categoria.vigente ? 'bi-x-circle' : 'bi-check-circle'}`}></i>
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
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'} Presupuestaria
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Código *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.codigoCategoria}
                        onChange={(e) => setFormData({ ...formData, codigoCategoria: e.target.value })}
                        required
                        placeholder="Ej: L33"
                        maxLength={20}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Tipo</label>
                      <select
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="">Seleccionar tipo...</option>
                        <option value="DOCENTE">Docente</option>
                        <option value="ADMINISTRATIVO">Administrativo</option>
                        <option value="TECNICO">Técnico</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Descripción *</label>
                      <textarea
                        className="form-control"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        required
                        rows={3}
                        placeholder="Descripción de la categoría presupuestaria"
                        maxLength={500}
                      />
                    </div>

                    {/* <div className="col-md-6">
                      <label className="form-label">Escala Salarial</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.escalaSalarial}
                        onChange={(e) => setFormData({ ...formData, escalaSalarial: e.target.value })}
                        placeholder="Ej: UNIVERSITARIA o ADMINISTRATIVA"
                      />
                    </div> */}
                    <div className="col-md-6">
                      <label className="form-label">Escala Salarial</label>
                      <select
                        className="form-select"
                        value={formData.escalaSalarial}
                        onChange={(e) => setFormData({ ...formData, escalaSalarial: e.target.value })}
                      >
                        <option value="">Seleccionar tipo...</option>
                        <option value="UNIVERSITARIA">Universitario</option>
                        <option value="ADMINISTRATIVA">Administrativo</option>
                        {/* <option value="TECNICO">Técnico</option> */}
                      </select>
                    </div>
                    <div className="col-md-6">
                      {/* Espacio vacío para alineación */}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Rango Salarial Mínimo (₲)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.rangoSalarialMin}
                        onChange={(e) => setFormData({ ...formData, rangoSalarialMin: e.target.value })}
                        placeholder="Ej: 2500000"
                        min="0"
                        step="1"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Rango Salarial Máximo (₲)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.rangoSalarialMax}
                        onChange={(e) => setFormData({ ...formData, rangoSalarialMax: e.target.value })}
                        placeholder="Ej: 3500000"
                        min="0"
                        step="1"
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="vigente"
                          checked={formData.vigente}
                          onChange={(e) => setFormData({ ...formData, vigente: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="vigente">
                          Vigente
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    {editingCategoria ? 'Actualizar' : 'Crear'}
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