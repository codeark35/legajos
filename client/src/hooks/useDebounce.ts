import { useEffect, useState } from 'react';

/**
 * Hook para hacer debounce de un valor
 * Útil para búsquedas en tiempo real
 * @param value - Valor a hacer debounce
 * @param delay - Delay en milisegundos (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancelar el timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
