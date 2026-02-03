/**
 * Utilidades para formateo de datos
 * Según guía de instrucciones para frontend
 */

/**
 * Formatea una fecha a formato local es-PY
 * @param dateString - String de fecha a formatear
 * @returns Fecha formateada o '-' si es inválida
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === 'Invalid Date') return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

/**
 * Formatea fecha y hora
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === 'Invalid Date') return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

/**
 * Formatea un monto a formato de moneda paraguaya (PYG)
 * @param amount - Monto a formatear
 * @returns Monto formateado o '-' si es inválido
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return '-';
  
  try {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(amount);
  } catch {
    return '-';
  }
};

/**
 * Formatea un número sin símbolo de moneda
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (!num && num !== 0) return '-';
  
  try {
    return new Intl.NumberFormat('es-PY').format(num);
  } catch {
    return '-';
  }
};

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Trunca un texto largo agregando "..."
 */
export const truncate = (str: string, maxLength: number = 50): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};
