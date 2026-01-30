import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="bi bi-folder2-open me-2"></i>
            Sistema de Legajos
          </span>
          <div className="navbar-nav ms-auto">
            <span className="nav-item text-white me-3 d-flex align-items-center">
              <i className="bi bi-person-circle me-2"></i>
              {user?.nombreUsuario} ({user?.rol})
            </span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h2>Dashboard</h2>
            <p className="text-muted">Bienvenido al Sistema de Gestión de Legajos</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-3">
            <div className="card text-center h-100 shadow-sm">
              <div className="card-body">
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">Personas</h5>
                <p className="card-text text-muted">Gestión de personas</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/personas')}
                >
                  Ver Personas
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card text-center h-100 shadow-sm">
              <div className="card-body">
                <i className="bi bi-folder2 text-success" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">Legajos</h5>
                <p className="card-text text-muted">Expedientes de personal</p>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/legajos')}
                >
                  Ver Legajos
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card text-center h-100 shadow-sm">
              <div className="card-body">
                <i className="bi bi-file-earmark-text text-info" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">Nombramientos</h5>
                <p className="card-text text-muted">Cargos y designaciones</p>
                <button
                  className="btn btn-info"
                  onClick={() => navigate('/nombramientos')}
                >
                  Ver Nombramientos
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card text-center h-100 shadow-sm">
              <div className="card-body">
                <i className="bi bi-building text-warning" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title mt-3">Facultades</h5>
                <p className="card-text text-muted">Dependencias</p>
                <button
                  className="btn btn-warning"
                  onClick={() => navigate('/facultades')}
                >
                  Ver Facultades
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Estadísticas Rápidas</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    Total de Personas
                    <span className="badge bg-primary rounded-pill">-</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    Legajos Activos
                    <span className="badge bg-success rounded-pill">-</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    Nombramientos Vigentes
                    <span className="badge bg-info rounded-pill">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Accesos Rápidos</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" onClick={() => navigate('/personas/new')}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Nueva Persona
                  </button>
                  <button className="btn btn-outline-success" onClick={() => navigate('/legajos/new')}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Nuevo Legajo
                  </button>
                  <button className="btn btn-outline-info" onClick={() => navigate('/nombramientos/new')}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Nuevo Nombramiento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
