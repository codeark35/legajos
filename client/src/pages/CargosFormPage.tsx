import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import cargosService from '../services/cargos.service';

export default function CargosFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombreCargo: '',
    descripcion: '',
    nivel: '',
    salarioBase: '',
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      loadCargo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadCargo = async () => {
    try {
      setIsLoading(true);
      const cargo = await cargosService.getById(id!);
      setFormData({
        nombreCargo: cargo.nombreCargo || '',
        descripcion: cargo.descripcion || '',
        nivel: cargo.nivel || '',
        salarioBase: cargo.salarioBase ? cargo.salarioBase.toString() : '',
        activo: cargo.activo,
      });
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cargar cargo');
      navigate('/cargos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombreCargo.trim()) {
      newErrors.nombreCargo = 'Nombre del cargo es requerido';
    }
    
    if (formData.salarioBase && isNaN(Number(formData.salarioBase))) {
      newErrors.salarioBase = 'Salario debe ser un número válido';
    }
    
    if (formData.salarioBase && Number(formData.salarioBase) < 0) {
      newErrors.salarioBase = 'Salario no puede ser negativo';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      
      const dataToSend = {
        nombreCargo: formData.nombreCargo,
        descripcion: formData.descripcion || undefined,
        nivel: formData.nivel || undefined,
        salarioBase: formData.salarioBase ? Number(formData.salarioBase) : undefined,
        activo: formData.activo,
      };

      if (isEditing) {
        await cargosService.update(id!, dataToSend);
        toast.success('Cargo actualizado exitosamente');
      } else {
        await cargosService.create(dataToSend);
        toast.success('Cargo creado exitosamente');
      }
      
      navigate('/cargos');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al guardar cargo');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
          <h2 className="mb-0">
            <i className="bi bi-briefcase text-primary me-2"></i>
            {isEditing ? 'Editar Cargo' : 'Nuevo Cargo'}
          </h2>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información del Cargo
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label htmlFor="nombreCargo" className="form-label">
                      Nombre del Cargo <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombreCargo ? 'is-invalid' : ''}`}
                      id="nombreCargo"
                      name="nombreCargo"
                      value={formData.nombreCargo}
                      onChange={handleChange}
                      placeholder="Ej: Profesor Titular, Asistente Administrativo"
                      required
                    />
                    {errors.nombreCargo && (
                      <div className="invalid-feedback">{errors.nombreCargo}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="nivel" className="form-label">
                      Nivel
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nivel"
                      name="nivel"
                      value={formData.nivel}
                      onChange={handleChange}
                      placeholder="Ej: Senior, Junior"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="descripcion" className="form-label">
                      Descripción
                    </label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      name="descripcion"
                      rows={3}
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Descripción opcional del cargo"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="salarioBase" className="form-label">
                      Salario Base (Guaraníes)
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.salarioBase ? 'is-invalid' : ''}`}
                      id="salarioBase"
                      name="salarioBase"
                      value={formData.salarioBase}
                      onChange={handleChange}
                      placeholder="Ej: 5000000"
                      min="0"
                      step="1"
                    />
                    {errors.salarioBase && (
                      <div className="invalid-feedback">{errors.salarioBase}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-block">Estado</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="activo"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="activo">
                        {formData.activo ? (
                          <span className="badge bg-success">Activo</span>
                        ) : (
                          <span className="badge bg-secondary">Inactivo</span>
                        )}
                      </label>
                    </div>
                    <small className="text-muted">
                      Solo los cargos activos estarán disponibles para nuevos nombramientos
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/cargos" className="btn btn-outline-secondary">
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {isEditing ? 'Actualizar' : 'Crear'} Cargo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-question-circle me-2"></i>
                Ayuda
              </h6>
            </div>
            <div className="card-body">
              <h6>Campos obligatorios</h6>
              <ul className="small mb-3">
                <li><strong>Nombre del Cargo:</strong> Nombre descriptivo del puesto</li>
              </ul>

              <h6>Campos opcionales</h6>
              <ul className="small mb-3">
                <li><strong>Nivel:</strong> Jerarquía o categoría del cargo</li>
                <li><strong>Descripción:</strong> Detalles adicionales sobre el cargo</li>
                <li><strong>Salario Base:</strong> Remuneración base en guaraníes</li>
              </ul>

              <div className="alert alert-info small mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Los cargos inactivos no estarán disponibles para nuevos nombramientos, pero se mantendrán en el sistema para fines históricos.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
