import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PersonasListPage from './pages/PersonasListPage';
import PersonasDetailPage from './pages/PersonasDetailPage';
import PersonasFormPage from './pages/PersonasFormPage';
import LegajosListPage from './pages/LegajosListPage';
import LegajosDetailPage from './pages/LegajosDetailPage';
import LegajosFormPage from './pages/LegajosFormPage';
import GestionLegajosPage from './pages/GestionLegajosPage';
import LineasPresupuestariasPage from './pages/LineasPresupuestariasPage';
import CategoriasPresupuestariasPage from './pages/CategoriasPresupuestariasPage';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente para proteger rutas
function PrivateRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              
              {/* Rutas de Personas */}
              <Route
                path="/personas"
                element={
                  <PrivateRoute>
                    <PersonasListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/personas/nuevo"
                element={
                  <PrivateRoute>
                    <PersonasFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/personas/:id"
                element={
                  <PrivateRoute>
                    <PersonasDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/personas/:id/editar"
                element={
                  <PrivateRoute>
                    <PersonasFormPage />
                  </PrivateRoute>
                }
              />

              {/* Rutas de Legajos */}
              <Route
                path="/legajos"
                element={
                  <PrivateRoute>
                    <LegajosListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/legajos/nuevo"
                element={
                  <PrivateRoute>
                    <LegajosFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/legajos/:id"
                element={
                  <PrivateRoute>
                    <LegajosDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/legajos/:id/editar"
                element={
                  <PrivateRoute>
                    <LegajosFormPage />
                  </PrivateRoute>
                }
              />

              {/* Nueva ruta: Gestión de Legajos con Accordion */}
              <Route
                path="/gestion-legajos"
                element={
                  <PrivateRoute>
                    <GestionLegajosPage />
                  </PrivateRoute>
                }
              />

              {/* Rutas de Presupuesto */}
              <Route
                path="/lineas-presupuestarias"
                element={
                  <PrivateRoute>
                    <LineasPresupuestariasPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/categorias-presupuestarias"
                element={
                  <PrivateRoute>
                    <CategoriasPresupuestariasPage />
                  </PrivateRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
