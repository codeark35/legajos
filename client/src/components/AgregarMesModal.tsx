import { useState, useEffect } from 'react';
import { useToast } from './ToastContainer';
import { formatGuaranieInput, parseGuaranieInput } from '../utils/formatters';

interface AgregarMesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (anio: number, mes: number, datos: DatosMes) => Promise<void>;
  nombreFuncionario: string;
  datosIniciales?: {
    anio: number;
    mes: number;
    datos: DatosMes;
  } | null;
  isEditing?: boolean;
}

interface DatosMes {
  presupuestado: number;
  devengado: number;
  aportesPatronales?: number;
  aportesPersonales?: number;
  observaciones?: string;
}

const MESES = [
  { num: 1, nombre: 'Enero' },
  { num: 2, nombre: 'Febrero' },
  { num: 3, nombre: 'Marzo' },
  { num: 4, nombre: 'Abril' },
  { num: 5, nombre: 'Mayo' },
  { num: 6, nombre: 'Junio' },
  { num: 7, nombre: 'Julio' },
  { num: 8, nombre: 'Agosto' },
  { num: 9, nombre: 'Septiembre' },
  { num: 10, nombre: 'Octubre' },
  { num: 11, nombre: 'Noviembre' },
  { num: 12, nombre: 'Diciembre' },
];

export default function AgregarMesModal({
  isOpen,
  onClose,
  onSubmit,
  nombreFuncionario,
  datosIniciales = null,
  isEditing = false,
}: AgregarMesModalProps) {
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    anio: currentYear,
    mes: new Date().getMonth() + 1,
    presupuestado: '',
    devengado: '',
    aportesPatronales: '',
    aportesPersonales: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos iniciales si está editando
  useEffect(() => {
    if (datosIniciales) {
      setFormData({
        anio: datosIniciales.anio,
        mes: datosIniciales.mes,
        presupuestado: formatGuaranieInput(datosIniciales.datos.presupuestado),
        devengado: formatGuaranieInput(datosIniciales.datos.devengado),
        aportesPatronales: datosIniciales.datos.aportesPatronales ? formatGuaranieInput(datosIniciales.datos.aportesPatronales) : '',
        aportesPersonales: datosIniciales.datos.aportesPersonales ? formatGuaranieInput(datosIniciales.datos.aportesPersonales) : '',
        observaciones: datosIniciales.datos.observaciones || '',
      });
    } else {
      // Resetear formulario al abrir modal para nuevo mes
      setFormData({
        anio: currentYear,
        mes: new Date().getMonth() + 1,
        presupuestado: '',
        devengado: '',
        aportesPatronales: '',
        aportesPersonales: '',
        observaciones: '',
      });
    }
    setErrors({});
  }, [datosIniciales, isOpen, currentYear]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const presupuestadoNum = parseGuaranieInput(formData.presupuestado);
    const devengadoNum = parseGuaranieInput(formData.devengado);
    const aportesPatronalesNum = formData.aportesPatronales ? parseGuaranieInput(formData.aportesPatronales) : 0;
    const aportesPersonalesNum = formData.aportesPersonales ? parseGuaranieInput(formData.aportesPersonales) : 0;

    if (!formData.presupuestado || presupuestadoNum <= 0) {
      newErrors.presupuestado = 'Debe ingresar un monto presupuestado válido';
    }

    if (!formData.devengado || devengadoNum <= 0) {
      newErrors.devengado = 'Debe ingresar un monto devengado válido';
    }

    if (formData.aportesPatronales && aportesPatronalesNum < 0) {
      newErrors.aportesPatronales = 'El monto no puede ser negativo';
    }

    if (formData.aportesPersonales && aportesPersonalesNum < 0) {
      newErrors.aportesPersonales = 'El monto no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      const datos: DatosMes = {
        presupuestado: parseGuaranieInput(formData.presupuestado),
        devengado: parseGuaranieInput(formData.devengado),
        aportesPatronales: formData.aportesPatronales
          ? parseGuaranieInput(formData.aportesPatronales)
          : undefined,
        aportesPersonales: formData.aportesPersonales
          ? parseGuaranieInput(formData.aportesPersonales)
          : undefined,
        observaciones: formData.observaciones || undefined,
      };

      await onSubmit(formData.anio, formData.mes, datos);
      toast.success(isEditing ? 'Mes actualizado exitosamente' : 'Mes agregado exitosamente');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar el mes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // Si es un campo de monto, formatear mientras escribe
    if (['presupuestado', 'devengado', 'aportesPatronales', 'aportesPersonales'].includes(field)) {
      // Permitir solo números
      const cleaned = value.replace(/[^0-9]/g, '');
      if (cleaned) {
        const formatted = formatGuaranieInput(cleaned);
        setFormData({ ...formData, [field]: formatted });
      } else {
        setFormData({ ...formData, [field]: '' });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Generar años (5 años atrás y 2 adelante)
  const anios = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                {isEditing ? 'Editar Mes' : 'Agregar Nuevo Mes'} - {nombreFuncionario}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isSubmitting}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Año y Mes */}
                  <div className="col-md-6">
                    <label htmlFor="anio" className="form-label">
                      Año <span className="text-danger">*</span>
                    </label>
                    <select
                      id="anio"
                      className="form-select"
                      value={formData.anio}
                      onChange={(e) => handleChange('anio', e.target.value)}
                      disabled={isSubmitting || isEditing}
                    >
                      {anios.map((anio) => (
                        <option key={anio} value={anio}>
                          {anio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="mes" className="form-label">
                      Mes <span className="text-danger">*</span>
                    </label>
                    <select
                      id="mes"
                      className="form-select"
                      value={formData.mes}
                      onChange={(e) => handleChange('mes', e.target.value)}
                      disabled={isSubmitting || isEditing}
                    >
                      {MESES.map((mes) => (
                        <option key={mes.num} value={mes.num}>
                          {mes.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Presupuestado */}
                  <div className="col-md-6">
                    <label htmlFor="presupuestado" className="form-label">
                      Presupuestado <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₲</span>
                      <input
                        type="text"
                        id="presupuestado"
                        className={`form-control ${errors.presupuestado ? 'is-invalid' : ''}`}
                        placeholder="3.021.000"
                        value={formData.presupuestado}
                        onChange={(e) => handleChange('presupuestado', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.presupuestado && (
                        <div className="invalid-feedback">{errors.presupuestado}</div>
                      )}
                    </div>
                  </div>

                  {/* Devengado */}
                  <div className="col-md-6">
                    <label htmlFor="devengado" className="form-label">
                      Devengado <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₲</span>
                      <input
                        type="text"
                        id="devengado"
                        className={`form-control ${errors.devengado ? 'is-invalid' : ''}`}
                        placeholder="3.021.000"
                        value={formData.devengado}
                        onChange={(e) => handleChange('devengado', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.devengado && (
                        <div className="invalid-feedback">{errors.devengado}</div>
                      )}
                    </div>
                  </div>

                  {/* Aporte Jubilatorio */}
                  <div className="col-md-6">
                    <label htmlFor="aportesPatronales" className="form-label">
                      Aporte Jubilatorio
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₲</span>
                      <input
                        type="text"
                        id="aportesPatronales"
                        className={`form-control ${errors.aportesPatronales ? 'is-invalid' : ''}`}
                        placeholder="604.200"
                        value={formData.aportesPatronales}
                        onChange={(e) => handleChange('aportesPatronales', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.aportesPatronales && (
                        <div className="invalid-feedback">{errors.aportesPatronales}</div>
                      )}
                    </div>
                  </div>

                  {/* Aportes Personales */}
                  <div className="col-md-6">
                    <label htmlFor="aportesPersonales" className="form-label">
                      Aportes Personales
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₲</span>
                      <input
                        type="text"
                        id="aportesPersonales"
                        className={`form-control ${errors.aportesPersonales ? 'is-invalid' : ''}`}
                        placeholder="0"
                        value={formData.aportesPersonales}
                        onChange={(e) => handleChange('aportesPersonales', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.aportesPersonales && (
                        <div className="invalid-feedback">{errors.aportesPersonales}</div>
                      )}
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="col-12">
                    <label htmlFor="observaciones" className="form-label">
                      Observaciones
                    </label>
                    <textarea
                      id="observaciones"
                      className="form-control"
                      rows={3}
                      placeholder="Notas adicionales (opcional)"
                      value={formData.observaciones}
                      onChange={(e) => handleChange('observaciones', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${isEditing ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                      {isEditing ? 'Actualizar Mes' : 'Guardar Mes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
