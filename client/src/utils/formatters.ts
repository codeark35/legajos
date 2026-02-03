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

/**
 * Formatea un número para input con separador de miles (formato guaraníes)
 * Ejemplo: 3000000 => "3.000.000"
 */
export const formatGuaranieInput = (value: number | string): string => {
  if (!value && value !== 0) return '';
  
  // Convertir a número si es string
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
  
  if (isNaN(num)) return '';
  
  // Formatear con separador de miles
  return new Intl.NumberFormat('es-PY').format(num);
};

/**
 * Convierte un string con formato guaraníes a número
 * Ejemplo: "3.000.000" => 3000000
 */
export const parseGuaranieInput = (value: string): number => {
  if (!value) return 0;
  
  // Remover todos los puntos (separadores de miles)
  const cleaned = value.replace(/\./g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
};
