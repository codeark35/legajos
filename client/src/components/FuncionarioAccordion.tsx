import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api.service';
import HistoricoMensualTable from './HistoricoMensualTable';
import AgregarMesModal from './AgregarMesModal';
import { useToast } from './ToastContainer';

interface Funcionario {
  id: string;
  legajoId: string;
  numeroLegajo: string;
  nombreCompleto: string;
  nombres: string;
  apellidos: string;
  numeroCedula: string;
  estado: string;
  estadoLegajo: string;
  facultad: string | null;
  cargo: string | null;
  fechaIngreso: string;
  asignacionId: string | null;
  salarioBase: number | null;
  moneda: string;
  categoriaPresupuestaria: any;
  lineaPresupuestaria: any;
}

interface FuncionarioAccordionProps {
  funcionario: Funcionario;
  isOpen: boolean;
  onToggle: () => void;
}

interface DatosMes {
  presupuestado: number;
  devengado: number;
  aportesPatronales?: number;
  aportesPersonales?: number;
  observaciones?: string;
}

export default function FuncionarioAccordion({
  funcionario,
  isOpen,
  onToggle,
}: FuncionarioAccordionProps) {
  const [showModal, setShowModal] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<{
    anio: number;
    mes: number;
    datos: DatosMes;
  } | null>(null);
  const toast = useToast();

  // Cargar histórico solo cuando está expandido
  const {
    data: historicoData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['historico-asignacion', funcionario.asignacionId],
    queryFn: async () => {
      if (!funcionario.asignacionId) return null;
      const response = await apiService.get(
        `/asignaciones-presupuestarias/${funcionario.asignacionId}/historico`
      );
      // El backend devuelve { success: true, data: { historico: {...} } }
      return response.data.data;
    },
    enabled: isOpen && !!funcionario.asignacionId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const handleAgregarMes = async (anio: number, mes: number, datos: DatosMes) => {
    if (!funcionario.asignacionId) {
      toast.error('Este funcionario no tiene asignación presupuestaria');
      return;
    }

    await apiService.post(
      `/asignaciones-presupuestarias/${funcionario.asignacionId}/historico/${anio}/${mes}`,
      datos
    );
    await refetch();
    setShowModal(false);
    setDatosEdicion(null);
  };

  const handleEliminarMes = async (anio: number, mes: number) => {
    if (!funcionario.asignacionId) return;

    await apiService.delete(
      `/asignaciones-presupuestarias/${funcionario.asignacionId}/historico/${anio}/${mes}`
    );
    await refetch();
  };

  const handleEditarMes = (anio: number, mes: number) => {
    const historico = historicoData?.historico || historicoData?.asignacion?.historicoMensual || {};
    const mesKey = mes.toString().padStart(2, '0');
    const datos = historico[anio]?.[mesKey];

    if (datos) {
      setDatosEdicion({ anio, mes, datos });
      setShowModal(true);
    }
  };

  const handleNuevoMes = () => {
    setDatosEdicion(null);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-success';
      case 'INACTIVO':
        return 'bg-secondary';
      case 'SUSPENDIDO':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <>
      <div className="accordion-item">
        {/* Header - Siempre visible */}
        <h2 className="accordion-header">
          <button
            className={`accordion-button ${!isOpen ? 'collapsed' : ''}`}
            type="button"
            onClick={onToggle}
          >
            <div className="d-flex align-items-center w-100 pe-3">
              <div className="me-3">
                <i className="bi bi-person-circle fs-4 text-primary"></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                  <div>
                    <strong className="d-block mb-1">{funcionario.nombreCompleto}</strong>
                    <div className="d-flex flex-wrap gap-3 small text-muted">
                      <span>
                        <i className="bi bi-file-earmark-text me-1"></i>
                        Legajo: <strong>{funcionario.numeroLegajo || 'N/A'}</strong>
                      </span>
                      <span>
                        <i className="bi bi-card-text me-1"></i>
                        CI: <strong>{funcionario.numeroCedula}</strong>
                      </span>
                      <span>
                        <i className="bi bi-briefcase me-1"></i>
                        {funcionario.cargo || 'Sin cargo'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 mt-md-0">
                    <span className={`badge ${getBadgeClass(funcionario.estado)}`}>
                      {funcionario.estado}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </h2>

        {/* Body - Solo visible cuando está expandido */}
        {isOpen && (
          <div className="accordion-collapse collapse show">
            <div className="accordion-body">
              {/* Información adicional */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        <i className="bi bi-building me-1"></i>
                        Dependencia
                      </small>
                      <strong>{funcionario.facultad || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        Ingreso
                      </small>
                      <strong>{formatDate(funcionario.fechaIngreso)}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body">
                      <small className="text-muted d-block mb-1">
                        <i className="bi bi-cash-stack me-1"></i>
                        Salario Base
                      </small>
                      <strong>
                        {funcionario.salarioBase
                          ? formatCurrency(funcionario.salarioBase)
                          : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100 h-100"
                    onClick={handleNuevoMes}
                    disabled={!funcionario.asignacionId}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar Mes
                  </button>
                </div>
              </div>

              {/* Histórico mensual */}
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-calendar3 me-2"></i>
                    HISTÓRICO MENSUAL
                  </h5>
                </div>
                <div className="card-body p-0">
                  {!funcionario.asignacionId ? (
                    <div className="alert alert-warning mb-0">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Este funcionario no tiene asignación presupuestaria configurada
                    </div>
                  ) : (
                    <HistoricoMensualTable
                      historico={
                        historicoData?.historico ||
                        historicoData?.asignacion?.historicoMensual ||
                        {}
                      }
                      onEliminarMes={handleEliminarMes}
                      onEditarMes={handleEditarMes}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar mes */}
      <AgregarMesModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setDatosEdicion(null);
        }}
        onSubmit={handleAgregarMes}
        nombreFuncionario={funcionario.nombreCompleto}
        datosIniciales={datosEdicion}
        isEditing={!!datosEdicion}
      />
    </>
  );
}
