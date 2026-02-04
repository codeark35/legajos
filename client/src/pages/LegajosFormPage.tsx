import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import { useLegajo, useCreateLegajo, useUpdateLegajo } from '../hooks/useLegajos';
import { usePersonas } from '../hooks/usePersonas';
import { useFacultades } from '../hooks/useFacultades';

export default function LegajosFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = !!id;

  const { data } = useLegajo(id!, { enabled: isEditing });
  const { data: personasData } = usePersonas({ page: 1, limit: 100 });
  const { data: facultadesData } = useFacultades({ activo: true, page: 1, limit: 100 });
  const createMutation = useCreateLegajo();
  const updateMutation = useUpdateLegajo();

  const [formData, setFormData] = useState({
    numeroLegajo: '',
    personaId: '',
    tipoLegajo: 'DOCENTE',
    facultadId: '',
    fechaApertura: new Date().toISOString().split('T')[0],
    estadoLegajo: 'ACTIVO',
    observaciones: '',
  });
  console.log('formData', facultadesData);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isEditing && data) {
      const legajo = data;
      setFormData({
        numeroLegajo: legajo.numeroLegajo || '',
        personaId: legajo.personaId || '',
        tipoLegajo: legajo.tipoLegajo || 'DOCENTE',
        facultadId: legajo.facultadId || '',
        fechaApertura: legajo.fechaApertura
          ? new Date(legajo.fechaApertura).toISOString().split('T')[0]
          : '',
        estadoLegajo: legajo.estadoLegajo || 'ACTIVO',
        observaciones: legajo.observaciones || '',
      });
    }
  }, [data, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.numeroLegajo.trim())
      newErrors.numeroLegajo = 'Número de legajo es requerido';
    if (!formData.personaId) newErrors.personaId = 'Debe seleccionar una persona';
    if (!formData.facultadId) newErrors.facultadId = 'Debe seleccionar una facultad';
    if (!formData.fechaApertura) newErrors.fechaApertura = 'Fecha de apertura es requerida';
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
      const dataToSend = {
        ...formData,
      } as any;

      if (isEditing) {
        await updateMutation.mutateAsync({ id: id!, data: dataToSend });
        toast.success('Legajo actualizado exitosamente');
      } else {
        await createMutation.mutateAsync(dataToSend);
        toast.success('Legajo creado exitosamente');
      }
      navigate('/legajos');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar legajo');
    }
  };

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">
            <i className="bi bi-file-earmark-text text-primary me-2"></i>
            {isEditing ? 'Editar Legajo' : 'Nuevo Legajo'}
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
                  Información del Legajo
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="numeroLegajo" className="form-label">
                      Número de Legajo <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.numeroLegajo ? 'is-invalid' : ''}`}
                      id="numeroLegajo"
                      name="numeroLegajo"
                      value={formData.numeroLegajo}
                      onChange={handleChange}
                      placeholder="LEG-2026-001"
                      required
                    />
                    {errors.numeroLegajo && (
                      <div className="invalid-feedback">{errors.numeroLegajo}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="personaId" className="form-label">
                      Persona <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.personaId ? 'is-invalid' : ''}`}
                      id="personaId"
                      name="personaId"
                      value={formData.personaId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una persona</option>
                      {personasData?.data?.map((persona: any) => (
                        <option key={persona.id} value={persona.id}>
                          {persona.nombres} {persona.apellidos} - {persona.numeroCedula}
                        </option>
                      ))}
                    </select>
                    {errors.personaId && (
                      <div className="invalid-feedback">{errors.personaId}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="tipoLegajo" className="form-label">
                      Tipo de Legajo <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="tipoLegajo"
                      name="tipoLegajo"
                      value={formData.tipoLegajo}
                      onChange={handleChange}
                      required
                    >
                      <option value="DOCENTE">DOCENTE</option>
                      <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                      <option value="TECNICO">TÉCNICO</option>
                      <option value="DIRECTIVO">DIRECTIVO</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="facultadId" className="form-label">
                      Facultad <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.facultadId ? 'is-invalid' : ''}`}
                      id="facultadId"
                      name="facultadId"
                      value={formData.facultadId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una facultad</option>
                      {facultadesData?.map((facultad: any) => (
                        <option key={facultad.id} value={facultad.id}>
                          {facultad.nombreFacultad}
                        </option>
                      ))}
                    </select>
                    {errors.facultadId && (
                      <div className="invalid-feedback">{errors.facultadId}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="fechaApertura" className="form-label">
                      Fecha de Apertura <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.fechaApertura ? 'is-invalid' : ''}`}
                      id="fechaApertura"
                      name="fechaApertura"
                      value={formData.fechaApertura}
                      onChange={handleChange}
                      required
                    />
                    {errors.fechaApertura && (
                      <div className="invalid-feedback">{errors.fechaApertura}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="estadoLegajo" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="estadoLegajo"
                      name="estadoLegajo"
                      value={formData.estadoLegajo}
                      onChange={handleChange}
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="CERRADO">CERRADO</option>
                      <option value="SUSPENDIDO">SUSPENDIDO</option>
                      <option value="ARCHIVADO">ARCHIVADO</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="observaciones" className="form-label">
                      Observaciones
                    </label>
                    <textarea
                      className="form-control"
                      id="observaciones"
                      name="observaciones"
                      rows={3}
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Notas adicionales sobre el legajo..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/legajos" className="btn btn-outline-secondary">
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle text-primary me-2"></i>
                Información
              </h6>
              <ul className="small mb-0">
                <li>El número de legajo debe ser único</li>
                <li>Seleccione la persona a la que pertenece el legajo</li>
                <li>La facultad es obligatoria y determina la unidad académica</li>
                <li>El tipo de legajo define la clasificación del mismo</li>
                <li>La fecha de apertura indica cuándo se creó el legajo</li>
                <li>El estado por defecto es ACTIVO</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
