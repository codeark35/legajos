interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function StatCard({ title, value, icon, color, trend, subtitle }: StatCardProps) {
  return (
    <div className="card stat-card border-0 shadow-sm h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="text-muted mb-1 small text-uppercase fw-semibold">{title}</p>
            <h2 className="mb-0 fw-bold">{value}</h2>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div 
            className={`rounded-circle d-flex align-items-center justify-content-center bg-${color}-10`}
            style={{ width: '50px', height: '50px', minWidth: '50px', minHeight: '50px' }}
          >
            <i className={`bi ${icon} text-${color}`} style={{ fontSize: '1.5rem' }}></i>
          </div>
        </div>

        {trend && (
          <div className="d-flex align-items-center">
            <span className={`badge ${trend.isPositive ? 'bg-success' : 'bg-danger'} me-2`}>
              <i className={`bi bi-arrow-${trend.isPositive ? 'up' : 'down'} me-1`}></i>
              {Math.abs(trend.value)}%
            </span>
            <small className="text-muted">vs mes anterior</small>
          </div>
        )}
      </div>
    </div>
  );
}