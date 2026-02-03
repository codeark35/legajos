import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  useAsignacion,
  useHistoricoAnio,
  useAgregarMes,
  useEliminarMes,
  useAuditoriaAsignacion,
} from '../hooks/useAsignacionesPresupuestarias';

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

export default function AsignacionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [showAuditoria, setShowAuditoria] = useState(false);

  const { data: asignacion, isLoading } = useAsignacion(id!);
  const { data: historico, refetch: refetchHistorico } = useHistoricoAnio(id!, anioSeleccionado);
  const { data: auditoria } = useAuditoriaAsignacion(id!);
  const agregarMesMutation = useAgregarMes();
  const eliminarMesMutation = useEliminarMes();

  const [formData, setFormData] = useState({
    montoTotal: '',
    horasExtras: '',
    bonificaciones: '',
    descuentos: '',
    observaciones: '',
  });

  const handleAgregarMes = async (mes: number) => {
    if (!formData.montoTotal) {
      alert('Debe ingresar el monto total');
      return;
    }

    try {
      await agregarMesMutation.mutateAsync({
        id: id!,
        anio: anioSeleccionado,
        mes,
        datos: {
          montoTotal: parseFloat(formData.montoTotal),
          horasExtras: formData.horasExtras ? parseFloat(formData.horasExtras) : undefined,
          bonificaciones: formData.bonificaciones ? parseFloat(formData.bonificaciones) : undefined,
          descuentos: formData.descuentos ? parseFloat(formData.descuentos) : undefined,
          observaciones: formData.observaciones || undefined,
        },
      });
      
      // Limpiar formulario
      setFormData({
        montoTotal: '',
        horasExtras: '',
        bonificaciones: '',
        descuentos: '',
        observaciones: '',
      });
      setMesSeleccionado(null);
      refetchHistorico();
      alert('Mes agregado exitosamente');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Error al agregar mes'}`);
    }
  };

  const handleEliminarMes = async (mes: number) => {
    if (!window.confirm(`¿Eliminar datos de ${MESES[mes - 1].nombre}?`)) return;

    try {
      await eliminarMesMutation.mutateAsync({
        id: id!,
        anio: anioSeleccionado,
        mes,
      });
      refetchHistorico();
      alert('Mes eliminado exitosamente');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Error al eliminar mes'}`);
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
      <div className="row mb-3 mb-md-4">
        <div className="col-12 col-md mb-3 mb-md-0">
          <button className="btn btn-link ps-0 mb-2" onClick={() => navigate('/asignaciones')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
          <h2 className="fs-3 fs-md-2">
            <i className="bi bi-calendar3 text-primary me-2"></i>
            Histórico Mensual
          </h2>
        </div>
        <div className="col-12 col-md-auto">
          <button
            className="btn btn-outline-info"
            onClick={() => setShowAuditoria(!showAuditoria)}
          >
            <i className="bi bi-clock-history me-2"></i>
            {showAuditoria ? 'Ocultar' : 'Ver'} Auditoría
          </button>
        </div>
      </div>

      {/* Info de asignación */}
      {asignacion && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <strong>Categoría:</strong>
                <p className="mb-0">
                  {asignacion.categoriaPresupuestaria?.codigoCategoria || '-'}
                </p>
              </div>
              <div className="col-md-3">
                <strong>Línea:</strong>
                <p className="mb-0">
                  {asignacion.lineaPresupuestaria?.codigoLinea || '-'}
                </p>
              </div>
              <div className="col-md-3">
                <strong>Monto Base:</strong>
                <p className="mb-0">
                  {new Intl.NumberFormat('es-PY', {
                    style: 'currency',
                    currency: 'PYG',
                  }).format(asignacion.montoBase)}
                </p>
              </div>
              <div className="col-md-3">
                <strong>Fecha Inicio:</strong>
                <p className="mb-0">
                  {new Date(asignacion.fechaInicio).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auditoría */}
      {showAuditoria && auditoria && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Historial de Auditoría
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Campo</th>
                    <th>Valor Anterior</th>
                    <th>Valor Nuevo</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((registro: any) => (
                    <tr key={registro.id}>
                      <td>
                        <small>
                          {new Date(registro.fechaModificacion).toLocaleString('es-ES')}
                        </small>
                      </td>
                      <td><small>{registro.usuarioModificacion}</small></td>
                      <td><small>{registro.campoModificado}</small></td>
                      <td>
                        <small className="text-muted">
                          {registro.valorAnterior ? JSON.stringify(JSON.parse(registro.valorAnterior), null, 2).substring(0, 50) : 'null'}
                        </small>
                      </td>
                      <td>
                        <small className="text-success">
                          {registro.valorNuevo ? JSON.stringify(JSON.parse(registro.valorNuevo), null, 2).substring(0, 50) : 'null'}
                        </small>
                      </td>
                      <td><small>{registro.ipAddress}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Selector de año */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <strong>Año:</strong>
            </div>
            <div className="col-auto">
              <div className="btn-group">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setAnioSeleccionado(anioSeleccionado - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  {anioSeleccionado}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setAnioSeleccionado(anioSeleccionado + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de meses */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-nowrap">Mes</th>
                  <th className="text-nowrap">Monto Total</th>
                  <th className="text-nowrap d-none d-md-table-cell">Horas Extras</th>
                  <th className="text-nowrap d-none d-lg-table-cell">Bonificaciones</th>
                  <th className="text-nowrap d-none d-lg-table-cell">Descuentos</th>
                  <th className="text-nowrap d-none d-xl-table-cell">Observaciones</th>
                  <th className="text-end text-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((mes) => {
                  const datosMes = historico?.[mes.num];
                  const estaEnFormulario = mesSeleccionado === mes.num;

                  return (
                    <tr key={mes.num}>
                      <td>
                        <strong>{mes.nombre}</strong>
                      </td>
                      {datosMes ? (
                        <>
                          <td>
                            {new Intl.NumberFormat('es-PY', {
                              style: 'currency',
                              currency: 'PYG',
                            }).format(datosMes.montoTotal)}
                          </td>
                          <td>{datosMes.horasExtras || '-'}</td>
                          <td>
                            {datosMes.bonificaciones
                              ? new Intl.NumberFormat('es-PY', {
                                  style: 'currency',
                                  currency: 'PYG',
                                }).format(datosMes.bonificaciones)
                              : '-'}
                          </td>
                          <td>
                            {datosMes.descuentos
                              ? new Intl.NumberFormat('es-PY', {
                                  style: 'currency',
                                  currency: 'PYG',
                                }).format(datosMes.descuentos)
                              : '-'}
                          </td>
                          <td>
                            <small>{datosMes.observaciones || '-'}</small>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleEliminarMes(mes.num)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </>
                      ) : estaEnFormulario ? (
                        <>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Monto"
                              value={formData.montoTotal}
                              onChange={(e) =>
                                setFormData({ ...formData, montoTotal: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Horas"
                              value={formData.horasExtras}
                              onChange={(e) =>
                                setFormData({ ...formData, horasExtras: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Bonif."
                              value={formData.bonificaciones}
                              onChange={(e) =>
                                setFormData({ ...formData, bonificaciones: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Desc."
                              value={formData.descuentos}
                              onChange={(e) =>
                                setFormData({ ...formData, descuentos: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Obs."
                              value={formData.observaciones}
                              onChange={(e) =>
                                setFormData({ ...formData, observaciones: e.target.value })
                              }
                            />
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => handleAgregarMes(mes.num)}
                              >
                                <i className="bi bi-check"></i>
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => setMesSeleccionado(null)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td colSpan={5} className="text-muted">
                            <em>Sin datos</em>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setMesSeleccionado(mes.num)}
                            >
                              <i className="bi bi-plus"></i> Agregar
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
