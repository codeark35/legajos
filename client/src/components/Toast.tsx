import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info'
  }[type];

  const icon = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  }[type];

  return (
    <div
      className={`toast show ${bgColor} text-white`}
      role="alert"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <div className="toast-body d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${icon}`}></i>
          <span>{message}</span>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
}
