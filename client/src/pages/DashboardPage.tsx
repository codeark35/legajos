import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="row mb-4">
        <div className="col">
          <h2>Dashboard</h2>
          <p className="text-muted">Bienvenido al Sistema de Gestión de Legajos</p>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        <div className="col-6 col-md-3">
          <Link to="/personas" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body">
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="card-title mt-2 mt-md-3 fs-6 fs-md-5">Personas</h5>
                <p className="card-text text-muted small d-none d-md-block">Gestión de personas</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/legajos" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body">
                <i className="bi bi-file-earmark-text text-success" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="card-title mt-2 mt-md-3 fs-6 fs-md-5">Legajos</h5>
                <p className="card-text text-muted small d-none d-md-block">Gestión de legajos</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/gestion-legajos" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body">
                <i className="bi bi-calendar3 text-warning" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="card-title mt-2 mt-md-3 fs-6 fs-md-5">Histórico</h5>
                <p className="card-text text-muted small d-none d-md-block">Gestión mensual</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/lineas-presupuestarias" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body">
                <i className="bi bi-list-ol text-info" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="card-title mt-2 mt-md-3 fs-6 fs-md-5">Líneas</h5>
                <p className="card-text text-muted small d-none d-md-block">Líneas presupuestarias</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/categorias-presupuestarias" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body">
                <i className="bi bi-tags text-danger" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="card-title mt-2 mt-md-3 fs-6 fs-md-5">Categorías</h5>
                <p className="card-text text-muted small d-none d-md-block">Categorías presupuestarias</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-md-3">
          <Link to="/personas" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm hover-shadow">
              <div className="card-body">
                <i className="bi bi-clock-history text-secondary" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="card-title mt-2 mt-md-3 fs-6 fs-md-5">Auditoría</h5>
                <p className="card-text text-muted small d-none d-md-block">Historial de cambios</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart-fill me-2"></i>
                Resumen Rápido
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center g-3">
                <div className="col-6 col-md-3">
                  <div className="border-end border-md-end-0">
                    <h3 className="text-primary mb-0 fs-4 fs-md-3">-</h3>
                    <p className="text-muted mb-0 small">Personas Activas</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div>
                    <h3 className="text-success mb-0 fs-4 fs-md-3">-</h3>
                    <p className="text-muted mb-0 small">Legajos Activos</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border-end border-md-end-0">
                    <h3 className="text-warning mb-0 fs-4 fs-md-3">-</h3>
                    <p className="text-muted mb-0 small">Asignaciones</p>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div>
                    <h3 className="text-info mb-0 fs-4 fs-md-3">-</h3>
                    <p className="text-muted mb-0 small">Cambios Este Mes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
