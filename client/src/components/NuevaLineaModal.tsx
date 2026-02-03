import { useState } from 'react';
import { useToast } from './ToastContainer';

interface NuevaLineaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: any) => Promise<void>;
}

export default function NuevaLineaModal({
  isOpen,
  onClose,
  onSuccess,
  onCreate,
}: NuevaLineaModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    codigoLinea: '',
    descripcion: '',
    vigente: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigoLinea.trim()) {
      newErrors.codigoLinea = 'El código es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
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
        codigoLinea: formData.codigoLinea.trim(),
        descripcion: formData.descripcion.trim(),
        vigente: formData.vigente,
      });

      toast.success('Línea presupuestaria creada exitosamente');
      setFormData({
        codigoLinea: '',
        descripcion: '',
        vigente: true,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear línea');
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
              Nueva Línea Presupuestaria
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Código */}
                <div className="col-12">
                  <label htmlFor="codigoLinea" className="form-label">
                    Código <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="codigoLinea"
                    className={`form-control ${errors.codigoLinea ? 'is-invalid' : ''}`}
                    placeholder="Ej: 100-001"
                    maxLength={20}
                    value={formData.codigoLinea}
                    onChange={(e) => handleChange('codigoLinea', e.target.value)}
                  />
                  {errors.codigoLinea && (
                    <div className="invalid-feedback">{errors.codigoLinea}</div>
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
                    placeholder="Ej: Personal docente permanente"
                    rows={2}
                    maxLength={500}
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                  />
                  {errors.descripcion && (
                    <div className="invalid-feedback">{errors.descripcion}</div>
                  )}
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
                    Crear Línea
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
