import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../assets';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <aside 
        className={`sidebar bg-dark text-white ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          width: sidebarCollapsed ? '70px' : '260px',
          transition: 'width 0.3s ease',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div className="p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
          {!sidebarCollapsed && (
            <Link className="text-decoration-none d-flex align-items-center text-white" to="/dashboard">
              <img src={Logo} alt="Logo" style={{ height: '35px', marginRight: '10px' }} />
              <span className="fw-bold">Legajos UNI</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to="/dashboard" className="text-white">
              <img src={Logo} alt="Logo" style={{ height: '35px' }} />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="nav flex-column p-3">
          <Link
            to="/dashboard"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/dashboard') ? 'bg-primary' : ''
            }`}
            style={{ transition: 'background 0.2s' }}
            title="Dashboard"
          >
            <i className="bi bi-speedometer2" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Dashboard</span>}
          </Link>

          <Link
            to="/personas"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/personas') ? 'bg-primary' : ''
            }`}
            title="Personas"
          >
            <i className="bi bi-people-fill" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Personas</span>}
          </Link>

          <Link
            to="/legajos"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/legajos') ? 'bg-primary' : ''
            }`}
            title="Legajos"
          >
            <i className="bi bi-file-earmark-text" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Legajos</span>}
          </Link>

          <Link
            to="/gestion-legajos"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/gestion-legajos') ? 'bg-primary' : ''
            }`}
            title="Gestión Histórico"
          >
            <i className="bi bi-calendar3" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Gestión Histórico</span>}
          </Link>

          {!sidebarCollapsed && <hr className="border-secondary my-3" />}
          
          {!sidebarCollapsed && (
            <small className="text-muted text-uppercase px-3 mb-2">Presupuesto</small>
          )}

          <Link
            to="/lineas-presupuestarias"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/lineas-presupuestarias') ? 'bg-primary' : ''
            }`}
            title="Líneas Presupuestarias"
          >
            <i className="bi bi-list-ol" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Líneas</span>}
          </Link>

          <Link
            to="/categorias-presupuestarias"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/categorias-presupuestarias') ? 'bg-primary' : ''
            }`}
            title="Categorías Presupuestarias"
          >
            <i className="bi bi-tags" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Categorías</span>}
          </Link>

          {!sidebarCollapsed && <hr className="border-secondary my-3" />}
          
          {!sidebarCollapsed && (
            <small className="text-muted text-uppercase px-3 mb-2">Recursos</small>
          )}

          <Link
            to="/cargos"
            className={`nav-link text-white d-flex align-items-center mb-2 rounded ${
              isActive('/cargos') ? 'bg-primary' : ''
            }`}
            title="Cargos"
          >
            <i className="bi bi-briefcase-fill" style={{ fontSize: '1.2rem', width: '24px' }}></i>
            {!sidebarCollapsed && <span className="ms-2">Cargos</span>}
          </Link>
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-top border-secondary">
          <button
            className="btn btn-sm btn-outline-light w-100"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir' : 'Contraer'}
          >
            <i className={`bi bi-${sidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
            {!sidebarCollapsed && <span className="ms-2">Contraer</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className="flex-grow-1" 
        style={{ 
          marginLeft: sidebarCollapsed ? '70px' : '260px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Top Navbar */}
        <nav className="navbar navbar-expand navbar-light bg-white border-bottom shadow-sm sticky-top">
          <div className="container-fluid">
            <button
              className="btn btn-link text-dark d-md-none"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
            </button>

            <div className="ms-auto d-flex align-items-center">
              {/* Notifications */}
              <button className="btn btn-link text-dark position-relative me-2">
                <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  3
                </span>
              </button>

              {/* User Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: '35px', height: '35px' }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span className="d-none d-md-inline text-dark">{user?.nombreUsuario || user?.email}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <div className="dropdown-item-text">
                      <div className="fw-bold">{user?.nombreUsuario}</div>
                      <small className="text-muted">{user?.email}</small>
                      <div className="mt-1">
                        <span className="badge bg-primary">{user?.rol}</span>
                      </div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/perfil">
                      <i className="bi bi-person me-2"></i>
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/configuracion">
                      <i className="bi bi-gear me-2"></i>
                      Configuración
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="bg-light" style={{ minHeight: 'calc(100vh - 56px - 60px)' }}>
          <div className="container-fluid p-4">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start">
                <small className="text-muted">
                  © 2026 Universidad Nacional de Itapúa - Sistema de Legajos
                </small>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <small className="text-muted">
                  Versión 1.0.0 | <a href="#" className="text-muted">Soporte</a>
                </small>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
