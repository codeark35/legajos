interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function LoadingSkeleton({ rows = 5, columns = 6 }: LoadingSkeletonProps) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx}>
                <div
                  className="placeholder-glow"
                  style={{ width: '100%', height: '20px' }}
                >
                  <span className="placeholder col-8"></span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx}>
                  <div className="placeholder-glow">
                    <span className="placeholder col-10"></span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
