import { useState } from 'react';
import { useToast } from './ToastContainer';
import { formatGuaranieInput, parseGuaranieInput } from '../utils/formatters';

interface NuevaCategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: any) => Promise<void>;
}

export default function NuevaCategoriaModal({
  isOpen,
  onClose,
  onSuccess,
  onCreate,
}: NuevaCategoriaModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    codigoCategoria: '',
    descripcion: '',
    rangoSalarialMin: '',
    rangoSalarialMax: '',
    vigente: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    if (field === 'rangoSalarialMin' || field === 'rangoSalarialMax') {
      const cleaned = (value as string).replace(/[^0-9]/g, '');
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

    if (!formData.codigoCategoria.trim()) {
      newErrors.codigoCategoria = 'El código es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    const min = parseGuaranieInput(formData.rangoSalarialMin);
    const max = parseGuaranieInput(formData.rangoSalarialMax);

    if (!formData.rangoSalarialMin || min <= 0) {
      newErrors.rangoSalarialMin = 'Debe ingresar un rango mínimo válido';
    }

    if (!formData.rangoSalarialMax || max <= 0) {
      newErrors.rangoSalarialMax = 'Debe ingresar un rango máximo válido';
    }

    if (min > 0 && max > 0 && min > max) {
      newErrors.rangoSalarialMax = 'El rango máximo debe ser mayor al mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        codigoCategoria: formData.codigoCategoria.trim(),
        descripcion: formData.descripcion.trim(),
        rangoSalarialMin: parseGuaranieInput(formData.rangoSalarialMin),
        rangoSalarialMax: parseGuaranieInput(formData.rangoSalarialMax),
        vigente: formData.vigente,
      });

      toast.success('Categoría creada exitosamente');
      setFormData({
        codigoCategoria: '',
        descripcion: '',
        rangoSalarialMin: '',
        rangoSalarialMax: '',
        vigente: true,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              Nueva Categoría Presupuestaria
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Código */}
                <div className="col-12">
                  <label htmlFor="codigoCategoria" className="form-label">
                    Código <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="codigoCategoria"
                    className={`form-control ${errors.codigoCategoria ? 'is-invalid' : ''}`}
                    placeholder="Ej: L33"
                    maxLength={20}
                    value={formData.codigoCategoria}
                    onChange={(e) => handleChange('codigoCategoria', e.target.value)}
                  />
                  {errors.codigoCategoria && (
                    <div className="invalid-feedback">{errors.codigoCategoria}</div>
                  )}
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="descripcion"
                    className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                    placeholder="Ej: Docente Técnico"
                    rows={2}
                    maxLength={500}
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                  />
                  {errors.descripcion && (
                    <div className="invalid-feedback">{errors.descripcion}</div>
                  )}
                </div>

                {/* Rango Mínimo */}
                <div className="col-md-6">
                  <label htmlFor="rangoSalarialMin" className="form-label">
                    Rango Mínimo <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₲</span>
                    <input
                      type="text"
                      id="rangoSalarialMin"
                      className={`form-control ${errors.rangoSalarialMin ? 'is-invalid' : ''}`}
                      placeholder="2.500.000"
                      value={formData.rangoSalarialMin}
                      onChange={(e) => handleChange('rangoSalarialMin', e.target.value)}
                    />
                    {errors.rangoSalarialMin && (
                      <div className="invalid-feedback">{errors.rangoSalarialMin}</div>
                    )}
                  </div>
                </div>

                {/* Rango Máximo */}
                <div className="col-md-6">
                  <label htmlFor="rangoSalarialMax" className="form-label">
                    Rango Máximo <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₲</span>
                    <input
                      type="text"
                      id="rangoSalarialMax"
                      className={`form-control ${errors.rangoSalarialMax ? 'is-invalid' : ''}`}
                      placeholder="3.500.000"
                      value={formData.rangoSalarialMax}
                      onChange={(e) => handleChange('rangoSalarialMax', e.target.value)}
                    />
                    {errors.rangoSalarialMax && (
                      <div className="invalid-feedback">{errors.rangoSalarialMax}</div>
                    )}
                  </div>
                </div>

                {/* Vigente */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="vigente"
                      className="form-check-input"
                      checked={formData.vigente}
                      onChange={(e) => handleChange('vigente', e.target.checked)}
                    />
                    <label htmlFor="vigente" className="form-check-label">
                      Vigente
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Crear Categoría
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
