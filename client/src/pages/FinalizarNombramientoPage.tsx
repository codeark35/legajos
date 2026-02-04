import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import nombramientosService from '../services/nombramientos.service';

interface FormData {
  fechaFin: string;
  observaciones: string;
}

export default function FinalizarNombramientoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    fechaFin: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Cargar datos del nombramiento
  const { data: nombramientoData, isLoading } = useQuery({
    queryKey: ['nombramiento', id],
    queryFn: () => nombramientosService.getById(id!),
    enabled: !!id,
  });

  // Mutation para finalizar
  const finalizarMutation = useMutation({
    mutationFn: () => {
      return nombramientosService.update(id!, {
        fechaFin: formData.fechaFin,
        vigente: false,
        observaciones: formData.observaciones || nombramientoData?.observaciones,
      });
    },
    onSuccess: () => {
      toast.success('Nombramiento finalizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['nombramiento', id] });
      queryClient.invalidateQueries({ queryKey: ['nombramientos'] });
      queryClient.invalidateQueries({ queryKey: ['legajo'] });
      navigate(-1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al finalizar nombramiento');
    },
  });

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de finalización es requerida';
    }

    if (formData.fechaFin && nombramientoData?.fechaInicio) {
      const inicio = new Date(nombramientoData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (fin < inicio) {
        newErrors.fechaFin = 'La fecha fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    const mensaje = `¿Está seguro que desea finalizar el nombramiento de ${
      nombramientoData?.cargo?.nombreCargo || 'este cargo'
    }?`;

    if (window.confirm(mensaje)) {
      finalizarMutation.mutate();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al cambiar
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!id) {
    return (
      <Layout>
        <div className="alert alert-danger">
          ID de nombramiento no proporcionado
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
              <i className="bi bi-x-circle text-danger me-2"></i>
              Finalizar Nombramiento
            </h2>
            <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información...</p>
        </div>
      ) : !nombramientoData ? (
        <div className="alert alert-warning">
          <h5 className="alert-heading">
            <i className="bi bi-info-circle me-2"></i>
            Nombramiento no encontrado
          </h5>
          <p className="mb-0">No se encontró información del nombramiento.</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            {/* Información del nombramiento */}
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Información del Nombramiento
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small">Legajo</label>
                    <p className="fw-bold mb-0">
                      {nombramientoData.legajo?.numeroLegajo || '-'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Funcionario</label>
                    <p className="fw-bold mb-0">
                      {nombramientoData.legajo?.persona?.nombres}{' '}
                      {nombramientoData.legajo?.persona?.apellidos}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Cargo</label>
                    <p className="fw-bold mb-0">
                      {nombramientoData.cargo?.nombreCargo || '-'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Fecha de Inicio</label>
                    <p className="fw-bold mb-0">
                      {nombramientoData.fechaInicio
                        ? new Date(nombramientoData.fechaInicio).toLocaleDateString('es-ES')
                        : '-'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small">Estado Actual</label>
                    <p className="mb-0">
                      <span
                        className={`badge ${
                          nombramientoData.estadoNombramiento === 'VIGENTE'
                            ? 'bg-success'
                            : 'bg-secondary'
                        }`}
                      >
                        {nombramientoData.estadoNombramiento}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de finalización */}
            <div className="card">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-x me-2"></i>
                  Datos de Finalización
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Fecha Fin */}
                    <div className="col-md-6">
                      <label htmlFor="fechaFin" className="form-label">
                        Fecha de Finalización <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        id="fechaFin"
                        name="fechaFin"
                        className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
                        value={formData.fechaFin}
                        onChange={handleChange}
                        min={
                          nombramientoData.fechaInicio
                            ? new Date(nombramientoData.fechaInicio).toISOString().split('T')[0]
                            : undefined
                        }
                        required
                      />
                      {errors.fechaFin && (
                        <div className="invalid-feedback">{errors.fechaFin}</div>
                      )}
                      <div className="form-text">
                        Debe ser posterior a la fecha de inicio (
                        {nombramientoData.fechaInicio
                          ? new Date(nombramientoData.fechaInicio).toLocaleDateString('es-ES')
                          : '-'}
                        )
                      </div>
                    </div>

                    {/* Observaciones */}
                    <div className="col-12">
                      <label htmlFor="observaciones" className="form-label">
                        Motivo de Finalización
                      </label>
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        className="form-control"
                        rows={3}
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Ej: Renuncia, Jubilación, Finalización de contrato, etc."
                      />
                    </div>

                    {/* Botones */}
                    <div className="col-12">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          onClick={() => navigate(-1)}
                          className="btn btn-outline-secondary"
                          disabled={finalizarMutation.isPending}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn btn-danger"
                          disabled={finalizarMutation.isPending}
                        >
                          {finalizarMutation.isPending ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Finalizando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Finalizar Nombramiento
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Panel informativo */}
          <div className="col-lg-4">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Atención
                </h6>
              </div>
              <div className="card-body">
                <p className="small mb-2">
                  <strong>Esta acción:</strong>
                </p>
                <ul className="small mb-0">
                  <li>Marcará el nombramiento como finalizado</li>
                  <li>Establecerá la fecha de fin</li>
                  <li>Cambiará el estado a NO VIGENTE</li>
                  <li>Se puede revertir editando el nombramiento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
