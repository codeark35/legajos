import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../assets';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Intentando login con:', email);
      await login({ email, password });
      console.log('Login exitoso, redirigiendo...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                           (err as { message?: string })?.message || 
                           'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('admin@unae.edu.py');
    setPassword('Admin123!');
  };

  return (
    <div className="min-vh-100 d-flex" style={{ 
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Left Side - Modern Design */}
      <div className="col-md-7 d-none d-md-flex align-items-center justify-content-center text-white p-5">
        <div className="text-center" style={{ maxWidth: '500px' }}>
          <img src={Logo} alt="Logo" style={{ height: '120px', marginBottom: '30px', filter: 'brightness(0) invert(1)' }} />
          <h1 className="display-4 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            Sistema de Legajos
          </h1>
          <p className="lead mb-4" style={{ fontSize: '1.3rem' }}>
            Universidad Nacional de Itapúa
          </p>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Gestión integral y moderna de expedientes de personal universitario
          </p>
          <div className="mt-5 d-flex justify-content-center gap-4">
            <div className="text-center">
              <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-shield-check" style={{ fontSize: '1.8rem' }}></i>
              </div>
              <div>Seguro</div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-lightning-charge" style={{ fontSize: '1.8rem' }}></i>
              </div>
              <div>Rápido</div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-graph-up-arrow" style={{ fontSize: '1.8rem' }}></i>
              </div>
              <div>Eficiente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="col-md-5 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="w-100" style={{ maxWidth: '450px' }}>
          <div className="card border-0 shadow-lg" style={{ borderRadius: '15px' }}>
            <div className="card-body p-5">
              {/* Mobile Logo */}
              <div className="text-center d-md-none mb-4">
                <img src={Logo} alt="Logo" style={{ height: '60px' }} />
              </div>

              <h2 className="text-center mb-2 fw-bold" style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Bienvenido
              </h2>
              <p className="text-center text-muted mb-4">
                Ingresa tus credenciales para continuar
              </p>

              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">
                    <i className="bi bi-envelope me-2"></i>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    placeholder="usuario@unae.edu.py"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">
                    <i className="bi bi-lock me-2"></i>
                    Contraseña
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control form-control-lg"
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ borderRadius: '10px 0 0 10px' }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ borderRadius: '0 10px 10px 0' }}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label text-muted" htmlFor="rememberMe">
                      Recordarme
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none small" style={{ color: '#667eea' }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100 text-white fw-semibold mb-3"
                  disabled={loading}
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    border: 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </button>

                {/* Test Credentials */}
                <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #dee2e6' }}>
                  <div className="text-center mb-2">
                    <small className="text-muted fw-semibold">
                      <i className="bi bi-info-circle me-1"></i>
                      Credenciales de prueba
                    </small>
                  </div>
                  <div className="text-muted small mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Email:</span>
                      <span className="font-monospace">admin@unae.edu.py</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Password:</span>
                      <span className="font-monospace">Admin123!</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={fillTestCredentials}
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-clipboard-check me-1"></i>
                    Usar credenciales de prueba
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <small className="text-muted">
              © 2026 Universidad Nacional de Itapúa. Todos los derechos reservados.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
