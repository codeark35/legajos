import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import HistoricoMensualTable from '../components/HistoricoMensualTable';
import AgregarMesModal from '../components/AgregarMesModal';
import { useToast } from '../components/ToastContainer';
import nombramientosService, { type MesData, type AgregarMesDto } from '../services/nombramientos.service';

export default function HistoricoMensualPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<{
    anio: number;
    mes: number;
    datos: MesData;
  } | null>(null);

  // Cargar histórico y datos del nombramiento
  const {
    data: historicoData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['historico-nombramiento', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de nombramiento no proporcionado');
      return await nombramientosService.getHistoricoMensual(id);
    },
    enabled: !!id,
  });
  console.log('Datos del histórico mensual:', historicoData);

  // Mutation para agregar mes
  const agregarMesMutation = useMutation({
    mutationFn: (dto: AgregarMesDto) => nombramientosService.agregarMes(id!, dto),
    onSuccess: () => {
      toast.success('Mes agregado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['historico-nombramiento', id] });
      setShowModal(false);
      setDatosEdicion(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al agregar el mes');
    },
  });

  // Mutation para actualizar mes
  const actualizarMesMutation = useMutation({
    mutationFn: ({ anio, mes, dto }: { anio: number; mes: number; dto: AgregarMesDto }) =>
      nombramientosService.actualizarMes(id!, anio, mes, dto),
    onSuccess: () => {
      toast.success('Mes actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['historico-nombramiento', id] });
      setShowModal(false);
      setDatosEdicion(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el mes');
    },
  });

  // Mutation para eliminar mes
  const eliminarMesMutation = useMutation({
    mutationFn: ({ anio, mes }: { anio: number; mes: number }) =>
      nombramientosService.eliminarMes(id!, anio, mes),
    onSuccess: () => {
      toast.success('Mes eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['historico-nombramiento', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el mes');
    },
  });

  const handleAgregarMes = async (dto: AgregarMesDto) => {
    if (datosEdicion) {
      actualizarMesMutation.mutate({
        anio: datosEdicion.anio,
        mes: datosEdicion.mes,
        dto,
      });
    } else {
      agregarMesMutation.mutate(dto);
    }
  };

  const handleEditarMes = (anio: number, mes: number, datos: MesData) => {
    setDatosEdicion({ anio, mes, datos });
    setShowModal(true);
  };

  const handleEliminarMes = (anio: number, mes: number) => {
    if (window.confirm(`¿Está seguro que desea eliminar el registro de ${mes}/${anio}?`)) {
      eliminarMesMutation.mutate({ anio, mes });
    }
  };

  if (!id) {
    return (
      <Layout>
        <div className="alert alert-danger">
          ID de nombramiento no proporcionado
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="bi bi-calendar3 text-primary me-2"></i>
              Histórico Mensual
            </h2>
            <div>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary me-2"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
                disabled={!historicoData}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Mes
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando histórico mensual...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <h5 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error al cargar histórico
          </h5>
          <p className="mb-0">
            {error instanceof Error ? error.message : 'No se pudo cargar el histórico mensual.'}
          </p>
          <hr />
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-danger">
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        </div>
      ) : !historicoData ? (
        <div className="alert alert-warning">
          <h5 className="alert-heading">
            <i className="bi bi-info-circle me-2"></i>
            Sin datos
          </h5>
          <p className="mb-0">No se encontró información del nombramiento.</p>
        </div>
      ) : (
        <>
          {/* Información del Nombramiento */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-briefcase me-2"></i>
                Información del Nombramiento
              </h5>
            </div>
            <div className="card-body">
              {(() => {
                // Calcular estado real
                const ahora = new Date();
                const fechaInicio = historicoData.nombramiento?.fechaInicio 
                  ? new Date(historicoData.nombramiento.fechaInicio) 
                  : null;
                const fechaFin = historicoData.nombramiento?.fechaFin 
                  ? new Date(historicoData.nombramiento.fechaFin) 
                  : null;
                const esVigente = historicoData.nombramiento?.vigente && 
                                fechaInicio && 
                                fechaInicio <= ahora && 
                                (!fechaFin || fechaFin >= ahora);
                
                let estadoReal = historicoData.nombramiento?.estadoNombramiento;
                if (!esVigente && fechaFin && fechaFin < ahora) {
                  estadoReal = 'FINALIZADO';
                } else if (fechaInicio && fechaInicio > ahora) {
                  estadoReal = 'PENDIENTE';
                }

                return (
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="text-muted small">Legajo</label>
                      <p className="fw-bold mb-0">
                        {historicoData.nombramiento?.legajo?.numeroLegajo || '-'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small">Funcionario</label>
                      <p className="fw-bold mb-0">
                        {historicoData.nombramiento?.legajo?.persona?.nombres}{' '}
                        {historicoData.nombramiento?.legajo?.persona?.apellidos}
                      </p>
                      <small className="text-muted">
                        CI: {historicoData.nombramiento?.legajo?.persona?.numeroCedula}
                      </small>
                    </div>
                    <div className="col-md-3">
                      <label className="text-muted small">Cédula</label>
                      <p className="fw-bold mb-0">
                        {historicoData.nombramiento?.legajo?.persona?.numeroCedula || '-'}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small">Cargo</label>
                      <p className="fw-bold mb-0">
                        {historicoData.nombramiento?.cargo?.nombreCargo || '-'}
                      </p>
                    </div>
                    <div className="col-md-3">
                      <label className="text-muted small">Categoría</label>
                      <p className="mb-0">
                        {historicoData.nombramiento?.categoria ? (
                          <span className="badge bg-secondary">
                            {historicoData.nombramiento.categoria}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </p>
                    </div>
                    <div className="col-md-3">
                      <label className="text-muted small">Fecha Inicio</label>
                      <p className="fw-bold mb-0">
                        {historicoData.nombramiento?.fechaInicio
                          ? new Date(historicoData.nombramiento.fechaInicio).toLocaleDateString('es-ES')
                          : '-'}
                      </p>
                    </div>
                    <div className="col-md-2">
                      <label className="text-muted small">Estado</label>
                      <p className="mb-0">
                        <span
                          className={`badge ${
                            esVigente
                              ? 'bg-success'
                              : estadoReal === 'FINALIZADO'
                              ? 'bg-secondary'
                              : estadoReal === 'PENDIENTE'
                              ? 'bg-info'
                              : 'bg-warning'
                          }`}
                        >
                          {esVigente ? 'VIGENTE' : estadoReal || '-'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small">Salario Base</label>
                      <p className="fw-bold fs-5 text-success mb-0">
                        {historicoData.nombramiento?.salarioBase
                          ? new Intl.NumberFormat('es-PY', {
                              style: 'currency',
                              currency: 'PYG',
                            }).format(historicoData.nombramiento.salarioBase)
                          : '-'}
                      </p>
                    </div>
                    {historicoData.nombramiento?.legajo?.id && (
                      <div className="col-12">
                        <Link
                          to={`/legajos/${historicoData.nombramiento.legajo.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye me-2"></i>
                          Ver Legajo Completo
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Tabla de Histórico Mensual */}
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar2-week me-2"></i>
                Histórico Mensual de Pagos
              </h5>
            </div>
            <div className="card-body">
              {!historicoData.historico || Object.keys(historicoData.historico).length === 0 ? (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  No hay registros mensuales. Haga clic en "Agregar Mes" para comenzar.
                </div>
              ) : (
                <HistoricoMensualTable
                  historico={historicoData.historico}
                  onEditar={handleEditarMes}
                  onEliminar={handleEliminarMes}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal para Agregar/Editar Mes */}
      <AgregarMesModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setDatosEdicion(null);
        }}
        onSubmit={handleAgregarMes}
        datosEdicion={datosEdicion}
        salarioBase={historicoData?.nombramiento?.salarioBase}
        isLoading={agregarMesMutation.isPending || actualizarMesMutation.isPending}
      />
    </Layout>
  );
}
