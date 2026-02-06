import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import dashboardService from '../services/dashboard.service';
import type { 
  DashboardStats, 
  ActividadReciente, 
  DistribucionFacultad,
  ResumenPresupuestario 
} from '../services/dashboard.service';


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    personasActivas: 0,
    legajosActivos: 0,
    nombramientosVigentes: 0,
    cambiosMes: 0,
  });
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [distribucion, setDistribucion] = useState<DistribucionFacultad[]>([]);
  const [resumenPresupuesto, setResumenPresupuesto] = useState<ResumenPresupuestario>({
    presupuestado: 0,
    devengado: 0,
    pendiente: 0,
    porcentajeEjecucion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todas las estadísticas en paralelo
      const [statsData, actividadesData, distribucionData, presupuestoData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActividadReciente(),
        dashboardService.getDistribucionFacultades(),
        dashboardService.getResumenPresupuestario(),
      ]);

      setStats(statsData);
      setActividades(actividadesData);
      setDistribucion(distribucionData);
      setResumenPresupuesto(presupuestoData);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 fw-bold">Dashboard</h2>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div>
              <button className="btn btn-outline-primary me-2">
                <i className="bi bi-download me-2"></i>
                Exportar Reporte
              </button>
              <button className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                Nuevo Legajo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Personas Activas"
            value={loading ? '...' : stats.personasActivas}
            icon="bi-people-fill"
            color="primary"
            trend={{ value: 5.2, isPositive: true }}
            subtitle="Personal registrado"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Legajos Activos"
            value={loading ? '...' : stats.legajosActivos}
            icon="bi-file-earmark-text-fill"
            color="success"
            trend={{ value: 3.1, isPositive: true }}
            subtitle="En gestión"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Nombramientos"
            value={loading ? '...' : stats.nombramientosVigentes}
            icon="bi-briefcase-fill"
            color="warning"
            trend={{ value: 2.4, isPositive: false }}
            subtitle="Vigentes actualmente"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Cambios Este Mes"
            value={loading ? '...' : stats.cambiosMes}
            icon="bi-clock-history"
            color="info"
            subtitle="Modificaciones"
          />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
                Acceso Rápido
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/personas" className="text-decoration-none">
                    <div className="quick-access-card text-center p-3 rounded h-100">
                      <div className="mb-2">
                        <i className="bi bi-people-fill text-primary" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h6 className="mb-0">Personas</h6>
                      <small className="text-muted">Gestión</small>
                    </div>
                  </Link>
                </div>
                
                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/legajos" className="text-decoration-none">
                    <div className="quick-access-card text-center p-3 rounded h-100">
                      <div className="mb-2">
                        <i className="bi bi-file-earmark-text text-success" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h6 className="mb-0">Legajos</h6>
                      <small className="text-muted">Consultar</small>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/gestion-legajos" className="text-decoration-none">
                    <div className="quick-access-card text-center p-3 rounded h-100">
                      <div className="mb-2">
                        <i className="bi bi-calendar3 text-warning" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h6 className="mb-0">Histórico</h6>
                      <small className="text-muted">Mensual</small>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/lineas-presupuestarias" className="text-decoration-none">
                    <div className="quick-access-card text-center p-3 rounded h-100">
                      <div className="mb-2">
                        <i className="bi bi-list-ol text-info" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h6 className="mb-0">Líneas</h6>
                      <small className="text-muted">Presupuesto</small>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/categorias-presupuestarias" className="text-decoration-none">
                    <div className="quick-access-card text-center p-3 rounded h-100">
                      <div className="mb-2">
                        <i className="bi bi-tags text-danger" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h6 className="mb-0">Categorías</h6>
                      <small className="text-muted">Escalas</small>
                    </div>
                  </Link>
                </div>

                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/personas/nuevo" className="text-decoration-none">
                    <div className="quick-access-card text-center p-3 rounded h-100 border-2 border-primary border-dashed">
                      <div className="mb-2">
                        <i className="bi bi-plus-circle text-primary" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <h6 className="mb-0 text-primary">Nueva</h6>
                      <small className="text-muted">Persona</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="row g-4">
        {/* Recent Activity */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-clock-history me-2 text-info"></i>
                Actividad Reciente
              </h5>
              <Link to="/historial" className="btn btn-sm btn-outline-primary">
                Ver todo
              </Link>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : actividades.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3 mb-0">No hay actividad reciente</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {actividades.map((actividad) => (
                    <div key={actividad.id} className="list-group-item p-3">
                      <div className="d-flex align-items-start">
                        <div className={`bg-${actividad.color} bg-opacity-10 rounded-circle p-2 me-3`}>
                          <i className={`bi ${actividad.icono} text-${actividad.color}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className="mb-1">
                              {actividad.tipo.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                            </h6>
                            <small className="text-muted">
                              {dashboardService.formatRelativeTime(actividad.fecha)}
                            </small>
                          </div>
                          <p className="mb-0 small text-muted">{actividad.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                Distribución por Facultad
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : distribucion.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <i className="bi bi-pie-chart" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3 mb-0">No hay datos disponibles</p>
                </div>
              ) : (
                <>
                  {distribucion.slice(0, 5).map((item, index) => {
                    const colors = ['primary', 'success', 'warning', 'info', 'secondary'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={item.facultad} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-truncate" style={{ maxWidth: '70%' }}>
                            {item.facultad}
                          </span>
                          <span className="fw-bold">{item.cantidad}</span>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div 
                            className={`progress-bar bg-${color}`} 
                            role="progressbar" 
                            style={{ width: `${item.porcentaje}%` }}
                            aria-valuenow={item.porcentaje}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-4 p-3 bg-light rounded">
                    <div className="row text-center">
                      <div className="col-6">
                        <h4 className="mb-0 text-primary fw-bold">{stats.legajosActivos}</h4>
                        <small className="text-muted">Total Legajos</small>
                      </div>
                      <div className="col-6">
                        <h4 className="mb-0 text-success fw-bold">{distribucion.length}</h4>
                        <small className="text-muted">Facultades</small>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-cash-stack me-2 text-success"></i>
                Resumen Presupuestario - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                  <button 
                    className="btn btn-sm btn-outline-primary ms-auto" 
                    onClick={loadDashboardData}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                      <i className="bi bi-wallet2 text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                      <h4 className="mb-0 fw-bold">
                        {dashboardService.formatCurrency(resumenPresupuesto.presupuestado)}
                      </h4>
                      <small className="text-muted">Presupuestado</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                      <i className="bi bi-check-circle text-success mb-2" style={{ fontSize: '2rem' }}></i>
                      <h4 className="mb-0 fw-bold">
                        {dashboardService.formatCurrency(resumenPresupuesto.devengado)}
                      </h4>
                      <small className="text-muted">Devengado</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                      <i className="bi bi-clock text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                      <h4 className="mb-0 fw-bold">
                        {dashboardService.formatCurrency(resumenPresupuesto.pendiente)}
                      </h4>
                      <small className="text-muted">Pendiente</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                      <i className="bi bi-percent text-info mb-2" style={{ fontSize: '2rem' }}></i>
                      <h4 className="mb-0 fw-bold">{resumenPresupuesto.porcentajeEjecucion}%</h4>
                      <small className="text-muted">Ejecución</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
