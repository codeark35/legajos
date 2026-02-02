/**
 * Construye respuesta de éxito estándar
 */
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}

/**
 * Construye respuesta de error estándar
 */
export function errorResponse(message: string, details?: any) {
  return {
    success: false,
    error: message,
    ...(details && { details }),
  };
}
