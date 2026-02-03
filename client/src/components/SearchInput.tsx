interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  resultsCount?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  isSearching = false,
  resultsCount,
}: SearchInputProps) {
  return (
    <div>
      <div className="position-relative">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {isSearching && (
          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Buscando...</span>
            </div>
          </div>
        )}
      </div>
      {value && (
        <small className="text-muted">
          {isSearching
            ? 'Buscando...'
            : resultsCount !== undefined
            ? `${resultsCount} resultado${resultsCount !== 1 ? 's' : ''} encontrado${resultsCount !== 1 ? 's' : ''}`
            : ''}
        </small>
      )}
    </div>
  );
}
