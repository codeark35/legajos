interface ErrorAlertProps {
  error: any;
  onRetry?: () => void;
}

export default function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const errorMessage = error?.response?.data?.message || error?.message || 'Ha ocurrido un error inesperado';

  return (
    <div className="alert alert-danger d-flex align-items-center" role="alert">
      <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
      <div className="flex-grow-1">
        <h6 className="alert-heading mb-1">Error al cargar datos</h6>
        <p className="mb-0 small">{errorMessage}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={onRetry}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Reintentar
        </button>
      )}
    </div>
  );
}
