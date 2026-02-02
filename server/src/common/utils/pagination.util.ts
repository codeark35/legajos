/**
 * Construye respuesta paginada estándar
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}

/**
 * Calcula offset para paginación
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
