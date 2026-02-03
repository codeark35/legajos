import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar errores de React
 * Previene que toda la app se caiga por un error en un componente
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por Error Boundary:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card border-danger">
                  <div className="card-body text-center p-5">
                    <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                    <h2 className="mt-4 mb-3">¡Oops! Algo salió mal</h2>
                    <p className="text-muted mb-4">
                      Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                    </p>
                    {this.state.error && (
                      <div className="alert alert-danger text-start mb-4">
                        <small className="font-monospace">
                          {this.state.error.message}
                        </small>
                      </div>
                    )}
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        onClick={this.handleReset}
                        className="btn btn-primary"
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Recargar Página
                      </button>
                      <button
                        onClick={() => window.history.back()}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver Atrás
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

    return this.props.children;
  }
}

export default ErrorBoundary;
