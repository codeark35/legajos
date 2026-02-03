import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Activar el modal de Bootstrap
      const modalElement = modalRef.current;
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Agregar backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'confirm-modal-backdrop';
        document.body.appendChild(backdrop);
      }
    } else {
      // Desactivar el modal
      const modalElement = modalRef.current;
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Remover backdrop
        const backdrop = document.getElementById('confirm-modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }

    return () => {
      // Cleanup
      document.body.classList.remove('modal-open');
      const backdrop = document.getElementById('confirm-modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const buttonClass = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    primary: 'btn-primary'
  }[variant];

  const icon = {
    danger: 'bi-exclamation-triangle-fill text-danger',
    warning: 'bi-exclamation-circle-fill text-warning',
    primary: 'bi-info-circle-fill text-primary'
  }[variant];

  return (
    <div
      ref={modalRef}
      className="modal fade"
      tabIndex={-1}
      role="dialog"
      aria-labelledby="confirmModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center pt-0">
            <div className="mb-3">
              <i className={`bi ${icon}`} style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="modal-title mb-3" id="confirmModalLabel">
              {title}
            </h5>
            <p className="text-muted mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0 justify-content-center">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${buttonClass}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
