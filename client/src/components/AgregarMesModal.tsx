import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import lineasService from '../services/lineas.service';
import categoriasService from '../services/categorias.service';
import { useToast } from './ToastContainer';
import { formatGuaranieInput, parseGuaranieInput } from '../utils/formatters';
import type { MesData } from '../services/nombramientos.service';

interface AgregarMesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (anio: number, mes: number, datos: MesData, lineaPresupuestariaId?: string, categoriaPresupuestariaId?: string) => Promise<void>;
  nombreFuncionario: string;
  datosIniciales?: {
    anio: number;
    mes: number;
    datos: MesData;
  } | null;
  isEditing?: boolean;
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

  // Cargar líneas y categorías presupuestarias vigentes
  const { data: lineas = [], isLoading: loadingLineas } = useQuery({
    queryKey: ['lineas-presupuestarias', 'vigentes'],
    queryFn: () => lineasService.getAll(true),
    enabled: isOpen,
  });

  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias-presupuestarias', 'vigentes'],
    queryFn: () => categoriasService.getAll(true),
    enabled: isOpen,
  });

  const [formData, setFormData] = useState({
    anio: currentYear,
    mes: new Date().getMonth() + 1,
    lineaPresupuestariaId: '',
    categoriaPresupuestariaId: '',
    presupuestado: '',
    devengado: '',
    aporteJubilatorio: '',
    aportesPersonales: '',
    objetoGasto: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos iniciales si está editando
  useEffect(() => {
    if (datosIniciales) {
      setFormData({
        anio: datosIniciales.anio,
        mes: datosIniciales.mes,
        lineaPresupuestariaId: datosIniciales.datos.lineaPresupuestariaId || '',
        categoriaPresupuestariaId: datosIniciales.datos.categoriaPresupuestariaId || '',
        presupuestado: formatGuaranieInput(datosIniciales.datos.presupuestado),
        devengado: formatGuaranieInput(datosIniciales.datos.devengado),
        aporteJubilatorio: datosIniciales.datos.aporteJubilatorio ? formatGuaranieInput(datosIniciales.datos.aporteJubilatorio) : '',
        aportesPersonales: datosIniciales.datos.aportesPersonales ? formatGuaranieInput(datosIniciales.datos.aportesPersonales) : '',
        objetoGasto: datosIniciales.datos.objetoGasto || '',
        observaciones: datosIniciales.datos.observaciones || '',
      });
    } else {
      // Resetear formulario al abrir modal para nuevo mes
      setFormData({
        anio: currentYear,
        mes: new Date().getMonth() + 1,
        lineaPresupuestariaId: '',
        categoriaPresupuestariaId: '',
        presupuestado: '',
        devengado: '',
        aporteJubilatorio: '',
        aportesPersonales: '',
        objetoGasto: '',
        observaciones: '',
      });
    }
    setErrors({});
  }, [datosIniciales, isOpen, currentYear]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validar línea y categoría presupuestaria
    if (!formData.lineaPresupuestariaId) {
      newErrors.lineaPresupuestariaId = 'Debe seleccionar una línea presupuestaria';
    }

    if (!formData.categoriaPresupuestariaId) {
      newErrors.categoriaPresupuestariaId = 'Debe seleccionar una categoría presupuestaria';
    }

    const presupuestadoNum = parseGuaranieInput(formData.presupuestado);
    const devengadoNum = parseGuaranieInput(formData.devengado);
    const aporteJubilatorioNum = formData.aporteJubilatorio ? parseGuaranieInput(formData.aporteJubilatorio) : 0;
    const aportesPersonalesNum = formData.aportesPersonales ? parseGuaranieInput(formData.aportesPersonales) : 0;

    if (!formData.presupuestado || presupuestadoNum <= 0) {
      newErrors.presupuestado = 'Debe ingresar un monto presupuestado válido';
    }

    if (!formData.devengado || devengadoNum <= 0) {
      newErrors.devengado = 'Debe ingresar un monto devengado válido';
    }

    if (formData.aporteJubilatorio && aporteJubilatorioNum < 0) {
      newErrors.aporteJubilatorio = 'El monto no puede ser negativo';
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
      const datos: MesData = {
        presupuestado: parseGuaranieInput(formData.presupuestado),
        devengado: parseGuaranieInput(formData.devengado),
        lineaPresupuestariaId: formData.lineaPresupuestariaId,
        categoriaPresupuestariaId: formData.categoriaPresupuestariaId,
        aporteJubilatorio: formData.aporteJubilatorio
          ? parseGuaranieInput(formData.aporteJubilatorio)
          : 0,
        aportesPersonales: formData.aportesPersonales
          ? parseGuaranieInput(formData.aportesPersonales)
          : 0,
        objetoGasto: formData.objetoGasto || undefined,
        observaciones: formData.observaciones || undefined,
      } as MesData;

      await onSubmit(formData.anio, formData.mes, datos, formData.lineaPresupuestariaId, formData.categoriaPresupuestariaId);
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
    if (['presupuestado', 'devengado', 'aporteJubilatorio', 'aportesPersonales'].includes(field)) {
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
                  {/* Línea Presupuestaria */}
                  <div className="col-md-6">
                    <label htmlFor="lineaPresupuestariaId" className="form-label">
                      Línea Presupuestaria <span className="text-danger">*</span>
                    </label>
                    <select
                      id="lineaPresupuestariaId"
                      className={`form-select ${errors.lineaPresupuestariaId ? 'is-invalid' : ''}`}
                      value={formData.lineaPresupuestariaId}
                      onChange={(e) => handleChange('lineaPresupuestariaId', e.target.value)}
                      disabled={isSubmitting || isEditing}
                    >
                      <option value="">Seleccione línea...</option>
                      {lineas.map((linea: any) => (
                        <option key={linea.id} value={linea.id}>
                          {linea.codigoLinea} - {linea.descripcion || 'Sin descripción'}
                        </option>
                      ))}
                    </select>
                    {errors.lineaPresupuestariaId && (
                      <div className="invalid-feedback d-block">{errors.lineaPresupuestariaId}</div>
                    )}
                  </div>

                  {/* Categoría Presupuestaria */}
                  <div className="col-md-6">
                    <label htmlFor="categoriaPresupuestariaId" className="form-label">
                      Categoría Presupuestaria <span className="text-danger">*</span>
                    </label>
                    <select
                      id="categoriaPresupuestariaId"
                      className={`form-select ${errors.categoriaPresupuestariaId ? 'is-invalid' : ''}`}
                      value={formData.categoriaPresupuestariaId}
                      onChange={(e) => handleChange('categoriaPresupuestariaId', e.target.value)}
                      disabled={isSubmitting || isEditing}
                    >
                      <option value="">Seleccione categoría...</option>
                      {categorias.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.codigoCategoria} - {cat.descripcion}
                        </option>
                      ))}
                    </select>
                    {errors.categoriaPresupuestariaId && (
                      <div className="invalid-feedback d-block">{errors.categoriaPresupuestariaId}</div>
                    )}
                  </div>

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
                    <label htmlFor="aporteJubilatorio" className="form-label">
                      Aporte Jubilatorio
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₲</span>
                      <input
                        type="text"
                        id="aporteJubilatorio"
                        className={`form-control ${errors.aporteJubilatorio ? 'is-invalid' : ''}`}
                        placeholder="150.000"
                        value={formData.aporteJubilatorio}
                        onChange={(e) => handleChange('aporteJubilatorio', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.aporteJubilatorio && (
                        <div className="invalid-feedback">{errors.aporteJubilatorio}</div>
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

                  {/* Objeto de Gasto */}
                  <div className="col-md-6">
                    <label htmlFor="objetoGasto" className="form-label">
                      Objeto de Gasto
                    </label>
                    <input
                      type="text"
                      id="objetoGasto"
                      className="form-control"
                      placeholder="Ej: 111"
                      value={formData.objetoGasto}
                      onChange={(e) => handleChange('objetoGasto', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <small className="form-text text-muted">Código del objeto de gasto</small>
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
