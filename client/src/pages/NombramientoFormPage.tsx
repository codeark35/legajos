import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import nombramientosService, { type CreateNombramientoDto } from '../services/nombramientos.service';
import cargosService, { type Cargo } from '../services/cargos.service';
import { legajosAPI } from '../services/legajos.service';

interface FormData {
  legajoId: string;
  cargoId: string;
  tipoNombramiento: string;
  categoria: string;
  salarioBase: string;
  fechaInicio: string;
  fechaFin: string;
  vigente: boolean;
  observaciones: string;
}

export default function NombramientoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const legajoIdParam = searchParams.get('legajoId');

  // Cargar datos del nombramiento si estamos editando
  const { data: nombramientoData, isLoading: loadingNombramiento } = useQuery({
    queryKey: ['nombramiento', id],
    queryFn: () => nombramientosService.getById(id!),
    enabled: isEditing,
  });

  // Cargar cargos
  const { data: cargos = [], isLoading: loadingCargos } = useQuery({
    queryKey: ['cargos'],
    queryFn: async () => {
      const data = await cargosService.getAll();
      console.log('🏢 Cargos cargados:', data);
      return data;
    },
  });

  // Cargar legajos
  const { data: legajosData, isLoading: loadingLegajos } = useQuery({
    queryKey: ['legajos-simple'],
    queryFn: async () => {
      const data = await legajosAPI.getAll({ page: 1, limit: 100 });
      console.log('📋 Legajos cargados:', data);
      return data;
    },
  });

  // Derive initial form data from nombramientoData
  const initialFormData = useMemo<FormData>(() => {
    if (nombramientoData) {
      console.log('📦 Datos del nombramiento cargados:', nombramientoData);
      return {
        legajoId: nombramientoData.legajoId || '',
        cargoId: nombramientoData.cargoId || '',
        tipoNombramiento: nombramientoData.tipoNombramiento || '',
        categoria: nombramientoData.categoria || '',
        salarioBase: nombramientoData.salarioBase ? String(nombramientoData.salarioBase) : '',
        fechaInicio: nombramientoData.fechaInicio
          ? new Date(nombramientoData.fechaInicio).toISOString().split('T')[0]
          : '',
        fechaFin: nombramientoData.fechaFin
          ? new Date(nombramientoData.fechaFin).toISOString().split('T')[0]
          : '',
        vigente: nombramientoData.vigente ?? true,
        observaciones: nombramientoData.observaciones || '',
      };
    }
    return {
      legajoId: legajoIdParam || '',
      cargoId: '',
      tipoNombramiento: '',
      categoria: '',
      salarioBase: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      vigente: true,
      observaciones: '',
    };
  }, [nombramientoData, legajoIdParam]);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Update formData when initialFormData changes
  useEffect(() => {
    console.log('🔄 Actualizando formData:', initialFormData);
    setFormData(initialFormData);
  }, [initialFormData]);

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: (dto: CreateNombramientoDto) => nombramientosService.create(dto),
    onSuccess: () => {
      toast.success('Nombramiento creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['nombramientos'] });
      queryClient.invalidateQueries({ queryKey: ['legajo'] });
      navigate(-1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear nombramiento');
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: (dto: CreateNombramientoDto) => nombramientosService.update(id!, dto),
    onSuccess: () => {
      toast.success('Nombramiento actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['nombramiento', id] });
      queryClient.invalidateQueries({ queryKey: ['nombramientos'] });
      queryClient.invalidateQueries({ queryKey: ['legajo'] });
      navigate(-1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar nombramiento');
    },
  });

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.legajoId) {
      newErrors.legajoId = 'El legajo es requerido';
    }

    if (!formData.cargoId) {
      newErrors.cargoId = 'El cargo es requerido';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (formData.fechaFin && formData.fechaInicio) {
      const inicio = new Date(formData.fechaInicio);
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

    const dto: CreateNombramientoDto = {
      legajoId: formData.legajoId,
      cargoId: formData.cargoId,
      tipoNombramiento: formData.tipoNombramiento || undefined,
      categoria: formData.categoria || undefined,
      salarioBase: formData.salarioBase ? parseFloat(formData.salarioBase) : undefined,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin || undefined,
      vigente: formData.vigente,
      observaciones: formData.observaciones || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(dto);
    } else {
      createMutation.mutate(dto);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar error al cambiar
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const isLoading = loadingNombramiento || loadingCargos || loadingLegajos;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const legajos = legajosData?.data?.data || [];

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'} text-primary me-2`}></i>
              {isEditing ? 'Editar Nombramiento' : 'Nuevo Nombramiento'}
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
          <p className="mt-3 text-muted">Cargando formulario...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Datos del Nombramiento
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Legajo */}
                    <div className="col-md-6">
                      <label htmlFor="legajoId" className="form-label">
                        Legajo <span className="text-danger">*</span>
                      </label>
                      <select
                        id="legajoId"
                        name="legajoId"
                        className={`form-select ${errors.legajoId ? 'is-invalid' : ''}`}
                        value={formData.legajoId}
                        onChange={handleChange}
                        disabled={isEditing || !!legajoIdParam}
                        required
                      >
                        <option value="">Seleccione un legajo</option>
                        {legajos.map((legajo: any) => (
                          <option key={legajo.id} value={legajo.id}>
                            {legajo.numeroLegajo} - {legajo.persona?.nombres} {legajo.persona?.apellidos}
                          </option>
                        ))}
                      </select>
                      {errors.legajoId && (
                        <div className="invalid-feedback">{errors.legajoId}</div>
                      )}
                    </div>

                    {/* Cargo */}
                    <div className="col-md-6">
                      <label htmlFor="cargoId" className="form-label">
                        Cargo <span className="text-danger">*</span>
                      </label>
                      <select
                        id="cargoId"
                        name="cargoId"
                        className={`form-select ${errors.cargoId ? 'is-invalid' : ''}`}
                        value={formData.cargoId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione un cargo</option>
                        {cargos
                          .map((cargo: Cargo) => (
                            <option key={cargo.id} value={cargo.id}>
                              {cargo.nombreCargo}
                              {cargo.nivel && ` - ${cargo.nivel}`}
                            </option>
                          ))}
                      </select>
                      {errors.cargoId && (
                        <div className="invalid-feedback">{errors.cargoId}</div>
                      )}
                    </div>

                    {/* Tipo de Nombramiento */}
                    <div className="col-md-6">
                      <label htmlFor="tipoNombramiento" className="form-label">
                        Tipo de Nombramiento
                      </label>
                      <input
                        type="text"
                        id="tipoNombramiento"
                        name="tipoNombramiento"
                        className="form-control"
                        value={formData.tipoNombramiento}
                        onChange={handleChange}
                        placeholder="Ej: Docente Técnico, Director, etc."
                      />
                      <div className="form-text">
                        Si se deja vacío, se usará el nombre del cargo
                      </div>
                    </div>

                    {/* Categoría */}
                    <div className="col-md-6">
                      <label htmlFor="categoria" className="form-label">
                        Categoría
                      </label>
                      <input
                        type="text"
                        id="categoria"
                        name="categoria"
                        className="form-control"
                        value={formData.categoria}
                        onChange={handleChange}
                        placeholder="Ej: L33, A2, etc."
                      />
                    </div>

                    {/* Salario Base */}
                    <div className="col-md-6">
                      <label htmlFor="salarioBase" className="form-label">
                        Salario Base
                      </label>
                      <input
                        type="number"
                        id="salarioBase"
                        name="salarioBase"
                        className="form-control"
                        value={formData.salarioBase}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1000"
                      />
                      <div className="form-text">Salario base mensual en guaraníes</div>
                    </div>

                    {/* Fecha Inicio */}
                    <div className="col-md-6">
                      <label htmlFor="fechaInicio" className="form-label">
                        Fecha de Inicio <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        id="fechaInicio"
                        name="fechaInicio"
                        className={`form-control ${errors.fechaInicio ? 'is-invalid' : ''}`}
                        value={formData.fechaInicio}
                        onChange={handleChange}
                        required
                      />
                      {errors.fechaInicio && (
                        <div className="invalid-feedback">{errors.fechaInicio}</div>
                      )}
                    </div>

                    {/* Fecha Fin */}
                    <div className="col-md-6">
                      <label htmlFor="fechaFin" className="form-label">
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        id="fechaFin"
                        name="fechaFin"
                        className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
                        value={formData.fechaFin}
                        onChange={handleChange}
                      />
                      {errors.fechaFin && (
                        <div className="invalid-feedback">{errors.fechaFin}</div>
                      )}
                      <div className="form-text">Dejar en blanco si el nombramiento está vigente</div>
                    </div>

                    {/* Vigente */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="vigente"
                          name="vigente"
                          className="form-check-input"
                          checked={formData.vigente}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="vigente">
                          Nombramiento vigente
                        </label>
                      </div>
                    </div>

                    {/* Observaciones */}
                    <div className="col-12">
                      <label htmlFor="observaciones" className="form-label">
                        Observaciones
                      </label>
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        className="form-control"
                        rows={3}
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Observaciones adicionales..."
                      />
                    </div>

                    {/* Botones */}
                    <div className="col-12">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          onClick={() => navigate(-1)}
                          className="btn btn-outline-secondary"
                          disabled={isSaving}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              {isEditing ? 'Actualizar' : 'Crear'} Nombramiento
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
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información
                </h6>
              </div>
              <div className="card-body">
                <p className="small mb-2">
                  <strong>Campos requeridos:</strong> Están marcados con <span className="text-danger">*</span>
                </p>
                <hr />
                <p className="small mb-2">
                  <strong>Legajo:</strong> Debe existir un legajo previo para crear un nombramiento.
                </p>
                <p className="small mb-2">
                  <strong>Cargo:</strong> Solo se muestran cargos activos.
                </p>
                <p className="small mb-2">
                  <strong>Vigente:</strong> Marca si el nombramiento está actualmente en curso.
                </p>
                <p className="small mb-0">
                  <strong>Fecha Fin:</strong> Se puede dejar vacía para nombramientos sin fecha de finalización.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
