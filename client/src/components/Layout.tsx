import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/dashboard">
            <i className="bi bi-folder-fill me-2"></i>
            <span className="d-none d-sm-inline">Sistema de Legajos</span>
            <span className="d-inline d-sm-none">Legajos</span>
          </Link>
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  to="/dashboard"
                >
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/personas') ? 'active' : ''}`}
                  to="/personas"
                >
                  <i className="bi bi-people-fill me-1"></i>
                  Personas
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/legajos') ? 'active' : ''}`}
                  to="/legajos"
                >
                  <i className="bi bi-file-earmark-text me-1"></i>
                  Legajos
                </Link>
              </li>
              <li className="nav-item">
                <Link                  className={`nav-link ${isActive('/gestion-legajos') ? 'active' : ''}`}
                  to="/gestion-legajos"
                >
                  <i className="bi bi-calendar3 me-2"></i>
                  Gestión Histórico
                </Link>
              </li>
              <li className="nav-item">
                <Link                  className={`nav-link ${isActive('/asignaciones') ? 'active' : ''}`}
                  to="/asignaciones"
                >
                  <i className="bi bi-cash-coin me-1"></i>
                  Asignaciones
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.email}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">Rol: {user?.rol}</small>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow-1 bg-light">
        <div className="container-fluid py-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-top py-3 mt-auto">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
              <small className="text-muted">
                © 2026 UNI - Sistema de Legajos
              </small>
            </div>
            <div className="col-12 col-md-6 text-center text-md-end">
              <small className="text-muted">
                v1.0.0
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
