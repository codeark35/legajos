import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import NuevaCategoriaModal from '../components/NuevaCategoriaModal';
import NuevaLineaModal from '../components/NuevaLineaModal';
import { 
  useAsignacion, 
  useCreateAsignacion, 
  useUpdateAsignacion 
} from '../hooks/useAsignacionesPresupuestarias';
import nombramientosService from '../services/nombramientos.service';
import categoriasService from '../services/categorias.service';
import lineasService from '../services/lineas.service';
import { formatGuaranieInput, parseGuaranieInput } from '../utils/formatters';

export default function AsignacionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id; // Si hay id, estamos editando; si no hay id, estamos creando

  console.log('AsignacionFormPage - id:', id);
  console.log('AsignacionFormPage - isEditing:', isEditing);

  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showLineaModal, setShowLineaModal] = useState(false);

  // Cargar datos para edición
  const { data: asignacion, isLoading: loadingAsignacion } = useAsignacion(
    id || '',
    { enabled: isEditing && !!id }
  );

  const [formData, setFormData] = useState(() => {
    if (asignacion && isEditing) {
      return {
        codigo: asignacion.codigo || '',
        descripcion: asignacion.descripcion || '',
        categoriaPresupuestariaId: asignacion.categoriaPresupuestariaId || '',
        lineaPresupuestariaId: asignacion.lineaPresupuestariaId || '',
        objetoGasto: asignacion.objetoGasto || '',
        salarioBase: asignacion.salarioBase ? formatGuaranieInput(asignacion.salarioBase) : '',
        moneda: asignacion.moneda || 'PYG',
      };
    }
    return {
      codigo: '',
      descripcion: '',
      categoriaPresupuestariaId: '',
      lineaPresupuestariaId: '',
      objetoGasto: '',
      salarioBase: '',
      moneda: 'PYG',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar opciones de selects (ya no necesitamos nombramientos)

  const { data: categorias = [], isLoading: loadingCategorias, error: errorCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.getAll,
  });

  console.log('categorias:', categorias);
  console.log('loadingCategorias:', loadingCategorias);
  console.log('errorCategorias:', errorCategorias);

  const { data: lineas = [], isLoading: loadingLineas, error: errorLineas } = useQuery({
    queryKey: ['lineas'],
    queryFn: lineasService.getAll,
  });

  console.log('lineas:', lineas);
  console.log('loadingLineas:', loadingLineas);
  console.log('errorLineas:', errorLineas);

  const createMutation = useCreateAsignacion();
  const updateMutation = useUpdateAsignacion();

  const handleChange = (field: string, value: string) => {
    if (field === 'salarioBase') {
      const cleaned = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [field]: cleaned ? formatGuaranieInput(cleaned) : '' });
    } else {
      setFormData({ ...formData, [field]: value });
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const salarioNum = parseGuaranieInput(formData.salarioBase);
    if (!formData.salarioBase || salarioNum <= 0) {
      newErrors.salarioBase = 'Debe ingresar un salario base válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategoria = async (data: any) => {
    await categoriasService.create(data);
    queryClient.invalidateQueries({ queryKey: ['categorias'] });
  };

  const handleCreateLinea = async (data: any) => {
    await lineasService.create(data);
    queryClient.invalidateQueries({ queryKey: ['lineas'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: any = {
      salarioBase: parseGuaranieInput(formData.salarioBase),
      moneda: formData.moneda,
    };

    if (formData.codigo) {
      payload.codigo = formData.codigo;
    }

    if (formData.descripcion) {
      payload.descripcion = formData.descripcion;
    }

    if (formData.categoriaPresupuestariaId) {
      payload.categoriaPresupuestariaId = formData.categoriaPresupuestariaId;
    }

    if (formData.lineaPresupuestariaId) {
      payload.lineaPresupuestariaId = formData.lineaPresupuestariaId;
    }

    if (formData.objetoGasto) {
      payload.objetoGasto = formData.objetoGasto;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
        toast.success('Asignación actualizada exitosamente');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Asignación creada exitosamente');
      }
      navigate('/asignaciones');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al guardar la asignación'
      );
    }
  };

  if (loadingAsignacion || loadingCategorias || loadingLineas) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <button className="btn btn-link ps-0 mb-2" onClick={() => navigate('/asignaciones')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
          <h2 className="mb-0 fs-3">
            <i className="bi bi-cash-coin text-primary me-2"></i>
            {isEditing ? 'Editar Asignación' : 'Nueva Asignación'} Presupuestaria
          </h2>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Código */}
              <div className="col-md-6">
                <label htmlFor="codigo" className="form-label">
                  Código
                </label>
                <input
                  type="text"
                  id="codigo"
                  className="form-control"
                  value={formData.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                  placeholder="Se generará automáticamente si se deja vacío"
                />
                <small className="text-muted">
                  Ej: CAT-L33-ABC123
                </small>
              </div>

              {/* Descripción */}
              <div className="col-md-6">
                <label htmlFor="descripcion" className="form-label">
                  Descripción
                </label>
                <input
                  type="text"
                  id="descripcion"
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Ej: Plaza de Docente Investigador"
                />
              </div>

              {/* Categoría */}
              <div className="col-md-6">
                <label htmlFor="categoriaPresupuestariaId" className="form-label">
                  Categoría Presupuestaria
                </label>
                <div className="input-group">
                  <select
                    id="categoriaPresupuestariaId"
                    className="form-select"
                    value={formData.categoriaPresupuestariaId}
                    onChange={(e) => handleChange('categoriaPresupuestariaId', e.target.value)}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.codigoCategoria} {c.descripcion ? `- ${c.descripcion}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowCategoriaModal(true)}
                    title="Nueva categoría"
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
              </div>

              {/* Línea */}
              <div className="col-md-6">
                <label htmlFor="lineaPresupuestariaId" className="form-label">
                  Línea Presupuestaria
                </label>
                <div className="input-group">
                  <select
                    id="lineaPresupuestariaId"
                    className="form-select"
                    value={formData.lineaPresupuestariaId}
                    onChange={(e) => handleChange('lineaPresupuestariaId', e.target.value)}
                  >
                    <option value="">Seleccione una línea</option>
                    {lineas.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.codigoLinea} {l.descripcion ? `- ${l.descripcion}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowLineaModal(true)}
                    title="Nueva línea"
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
              </div>

              {/* Objeto Gasto */}
              <div className="col-md-6">
                <label htmlFor="objetoGasto" className="form-label">
                  Objeto de Gasto
                </label>
                <input
                  type="text"
                  id="objetoGasto"
                  className="form-control"
                  placeholder="Ej: 110"
                  value={formData.objetoGasto}
                  onChange={(e) => handleChange('objetoGasto', e.target.value)}
                />
              </div>

              {/* Moneda */}
              <div className="col-md-6">
                <label htmlFor="moneda" className="form-label">
                  Moneda
                </label>
                <select
                  id="moneda"
                  className="form-select"
                  value={formData.moneda}
                  onChange={(e) => handleChange('moneda', e.target.value)}
                >
                  <option value="PYG">PYG - Guaraníes</option>
                  <option value="USD">USD - Dólares</option>
                  <option value="EUR">EUR - Euros</option>
                </select>
              </div>

              {/* Salario Base */}
              <div className="col-12">
                <label htmlFor="salarioBase" className="form-label">
                  Salario Base <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">₲</span>
                  <input
                    type="text"
                    id="salarioBase"
                    className={`form-control ${errors.salarioBase ? 'is-invalid' : ''}`}
                    placeholder="3.021.000"
                    value={formData.salarioBase}
                    onChange={(e) => handleChange('salarioBase', e.target.value)}
                  />
                  {errors.salarioBase && (
                    <div className="invalid-feedback">{errors.salarioBase}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {isEditing ? 'Actualizar' : 'Crear'} Asignación
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/asignaciones')}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modales */}
      <NuevaCategoriaModal
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSuccess={() => setShowCategoriaModal(false)}
        onCreate={handleCreateCategoria}
      />

      <NuevaLineaModal
        isOpen={showLineaModal}
        onClose={() => setShowLineaModal(false)}
        onSuccess={() => setShowLineaModal(false)}
        onCreate={handleCreateLinea}
      />
    </Layout>
  );
}
