import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon = 'bi-inbox',
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <i
          className={`bi ${icon} text-muted`}
          style={{ fontSize: '4rem', opacity: 0.3 }}
        ></i>
      </div>
      <h4 className="text-muted mb-2">{title}</h4>
      {description && (
        <p className="text-muted mb-4">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
