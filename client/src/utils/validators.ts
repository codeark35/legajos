/**
 * Utilidades para validación de formularios
 * Según guía de instrucciones para frontend
 */

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Valida que un campo no esté vacío
 */
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} es requerido`;
  }
  return null;
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
};

/**
 * Valida que un número sea positivo
 */
export const validatePositiveNumber = (value: any, fieldName: string): string | null => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número`;
  }
  if (num < 0) {
    return `${fieldName} no puede ser negativo`;
  }
  return null;
};

/**
 * Valida rango de un número
 */
export const validateRange = (
  value: any,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número`;
  }
  if (num < min || num > max) {
    return `${fieldName} debe estar entre ${min} y ${max}`;
  }
  return null;
};

/**
 * Valida longitud mínima de un string
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (!value) return null;
  if (value.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

/**
 * Valida longitud máxima de un string
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (!value) return null;
  if (value.length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
};

/**
 * Valida formato de cédula paraguaya (solo números)
 */
export const validateCedula = (cedula: string): string | null => {
  if (!cedula) return null;
  
  const cedulaRegex = /^\d+$/;
  if (!cedulaRegex.test(cedula)) {
    return 'La cédula debe contener solo números';
  }
  if (cedula.length < 5 || cedula.length > 8) {
    return 'La cédula debe tener entre 5 y 8 dígitos';
  }
  return null;
};

/**
 * Valida formato de teléfono paraguayo
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone) return null;
  
  // Acepta formatos: 0981234567, 021-123456, +595981234567
  const phoneRegex = /^(\+595|0)?[2-9]\d{7,8}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    return 'Formato de teléfono inválido';
  }
  return null;
};

/**
 * Valida que una fecha no sea futura
 */
export const validateNotFutureDate = (dateString: string): string | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date > now) {
    return 'La fecha no puede ser futura';
  }
  return null;
};

/**
 * Valida que una fecha esté dentro de un rango
 */
export const validateDateRange = (
  dateString: string,
  minDate: Date,
  maxDate: Date
): string | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (date < minDate || date > maxDate) {
    return `La fecha debe estar entre ${minDate.toLocaleDateString()} y ${maxDate.toLocaleDateString()}`;
  }
  return null;
};
