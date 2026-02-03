import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import { usePersona, useCreatePersona, useUpdatePersona } from '../hooks/usePersonas';

export default function PersonasFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = !!id;

  const { data } = usePersona(id!, { enabled: isEditing });
  const createMutation = useCreatePersona();
  const updateMutation = useUpdatePersona();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numeroCedula: '',
    fechaNacimiento: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'ACTIVO',
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isEditing && data) {
      const persona = data;
      setFormData({
        nombres: persona.nombres || '',
        apellidos: persona.apellidos || '',
        numeroCedula: persona.numeroCedula || '',
        fechaNacimiento: persona.fechaNacimiento
          ? new Date(persona.fechaNacimiento).toISOString().split('T')[0]
          : '',
        direccion: persona.direccion || '',
        telefono: persona.telefono || '',
        email: persona.email || '',
        estado: persona.estado || 'ACTIVO',
      });
    }
  }, [data, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.nombres.trim()) newErrors.nombres = 'Nombres son requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos son requeridos';
    if (!formData.numeroCedula.trim()) newErrors.numeroCedula = 'Cédula es requerida';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
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
      const dataToSend = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        numeroCedula: formData.numeroCedula,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        estado: formData.estado,
        fechaNacimiento: formData.fechaNacimiento || undefined,
      } as any;

      if (isEditing) {
        await updateMutation.mutateAsync({ id: id!, data: dataToSend });
        toast.success('Persona actualizada exitosamente');
      } else {
        await createMutation.mutateAsync(dataToSend);
        toast.success('Persona creada exitosamente');
      }
      navigate('/personas');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar persona');
    }
  };

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">
            <i className="bi bi-person text-primary me-2"></i>
            {isEditing ? 'Editar Persona' : 'Nueva Persona'}
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
                  Información Personal
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="nombres" className="form-label">
                      Nombres <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                      id="nombres"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                    />
                    {errors.nombres && (
                      <div className="invalid-feedback">{errors.nombres}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="apellidos" className="form-label">
                      Apellidos <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                    />
                    {errors.apellidos && (
                      <div className="invalid-feedback">{errors.apellidos}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="numeroCedula" className="form-label">
                      Número de Cédula <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.numeroCedula ? 'is-invalid' : ''}`}
                      id="numeroCedula"
                      name="numeroCedula"
                      value={formData.numeroCedula}
                      onChange={handleChange}
                      required
                    />
                    {errors.numeroCedula && (
                      <div className="invalid-feedback">{errors.numeroCedula}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="fechaNacimiento" className="form-label">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="direccion" className="form-label">
                      Dirección
                    </label>
                    <textarea
                      className="form-control"
                      id="direccion"
                      name="direccion"
                      rows={2}
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="telefono" className="form-label">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="estado" className="form-label">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="SUSPENDIDO">SUSPENDIDO</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/personas" className="btn btn-outline-secondary">
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
      </div>
    </Layout>
  );
}
