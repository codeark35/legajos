import apiService from './api.service';

export interface DashboardStats {
  personasActivas: number;
  legajosActivos: number;
  nombramientosVigentes: number;
  cambiosMes: number;
}

export interface ActividadReciente {
  id: string;
  tipo: 'PERSONA_CREADA' | 'LEGAJO_ACTUALIZADO' | 'NOMBRAMIENTO_MODIFICADO' | 'NOMBRAMIENTO_FINALIZADO';
  descripcion: string;
  fecha: string;
  icono: string;
  color: string;
}

export interface DistribucionFacultad {
  facultad: string;
  cantidad: number;
  porcentaje: number;
}

export interface ResumenPresupuestario {
  presupuestado: number;
  devengado: number;
  pendiente: number;
  porcentajeEjecucion: number;
}

// Interfaces auxiliares para los datos de la API
interface Legajo {
  id: string;
  facultadId?: string;
  [key: string]: unknown;
}

interface Facultad {
  id: string;
  nombreFacultad: string;
  [key: string]: unknown;
}

interface Nombramiento {
  id: string;
  historicoMensual?: {
    [key: string]: {
      presupuestado?: number;
      devengado?: number;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      // Obtener personas activas
      const personasResponse = await apiService.get('/personas', {
        params: { estado: 'ACTIVO' }
      });
      const personasActivas = personasResponse.data.total || personasResponse.data.length || 0;

      // Obtener legajos activos
      const legajosResponse = await apiService.get('/legajos', {
        params: { estadoLegajo: 'ACTIVO' }
      });
      const legajosActivos = legajosResponse.data.total || legajosResponse.data.length || 0;

      // Obtener nombramientos vigentes
      const nombramientosResponse = await apiService.get('/nombramientos', {
        params: { vigente: true }
      });
      const nombramientosVigentes = nombramientosResponse.data.total || nombramientosResponse.data.length || 0;

      // Cambios del mes (simulado por ahora, se puede implementar con historial)
      const cambiosMes = 12;

      return {
        personasActivas,
        legajosActivos,
        nombramientosVigentes,
        cambiosMes,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      // Retornar valores por defecto en caso de error
      return {
        personasActivas: 0,
        legajosActivos: 0,
        nombramientosVigentes: 0,
        cambiosMes: 0,
      };
    }
  }

  async getActividadReciente(): Promise<ActividadReciente[]> {
    try {
      // Por ahora retornar datos simulados
      // En el futuro se puede implementar con el endpoint de historial de cambios
      const actividades: ActividadReciente[] = [
        {
          id: '1',
          tipo: 'PERSONA_CREADA',
          descripcion: 'Nueva persona registrada en el sistema',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icono: 'bi-person-plus-fill',
          color: 'success',
        },
        {
          id: '2',
          tipo: 'LEGAJO_ACTUALIZADO',
          descripcion: 'Legajo actualizado con nueva información',
          fecha: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          icono: 'bi-file-earmark-text',
          color: 'primary',
        },
        {
          id: '3',
          tipo: 'NOMBRAMIENTO_MODIFICADO',
          descripcion: 'Datos presupuestarios cargados',
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          icono: 'bi-calendar-check',
          color: 'warning',
        },
        {
          id: '4',
          tipo: 'NOMBRAMIENTO_FINALIZADO',
          descripcion: 'Nombramiento finalizado',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icono: 'bi-x-circle',
          color: 'danger',
        },
      ];

      return actividades;
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return [];
    }
  }

  async getDistribucionFacultades(): Promise<DistribucionFacultad[]> {
    try {
      // Obtener todas las facultades
      const facultadesResponse = await apiService.get('/facultades');
      const facultades = facultadesResponse.data as Facultad[];

      // Obtener legajos y agrupar por facultad
      const legajosResponse = await apiService.get('/legajos', {
        params: { estadoLegajo: 'ACTIVO' }
      });
      const legajos = (legajosResponse.data.data || legajosResponse.data) as Legajo[];

      // Contar legajos por facultad
      const distribucion: { [key: string]: number } = {};
      let total = 0;

      legajos.forEach((legajo: Legajo) => {
        if (legajo.facultadId) {
          const facultad = facultades.find((f: Facultad) => f.id === legajo.facultadId);
          const nombre = facultad?.nombreFacultad || 'Sin Facultad';
          distribucion[nombre] = (distribucion[nombre] || 0) + 1;
          total++;
        }
      });

      // Convertir a array y calcular porcentajes
      const resultado: DistribucionFacultad[] = Object.entries(distribucion).map(([facultad, cantidad]) => ({
        facultad,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0,
      }));

      // Ordenar por cantidad descendente
      return resultado.sort((a, b) => b.cantidad - a.cantidad);
    } catch (error) {
      console.error('Error obteniendo distribución por facultades:', error);
      return [];
    }
  }

  async getResumenPresupuestario(): Promise<ResumenPresupuestario> {
    try {
      // Obtener nombramientos vigentes
      const nombramientosResponse = await apiService.get('/nombramientos', {
        params: { vigente: true }
      });
      const nombramientos = (nombramientosResponse.data.data || nombramientosResponse.data) as Nombramiento[];

      // Calcular totales del mes actual
      const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      let presupuestado = 0;
      let devengado = 0;

      nombramientos.forEach((nombramiento: Nombramiento) => {
        if (nombramiento.historicoMensual && nombramiento.historicoMensual[mesActual]) {
          const datos = nombramiento.historicoMensual[mesActual];
          presupuestado += Number(datos.presupuestado || 0);
          devengado += Number(datos.devengado || 0);
        }
      });

      const pendiente = presupuestado - devengado;
      const porcentajeEjecucion = presupuestado > 0 
        ? Math.round((devengado / presupuestado) * 100) 
        : 0;

      return {
        presupuestado,
        devengado,
        pendiente,
        porcentajeEjecucion,
      };
    } catch (error) {
      console.error('Error obteniendo resumen presupuestario:', error);
      return {
        presupuestado: 0,
        devengado: 0,
        pendiente: 0,
        porcentajeEjecucion: 0,
      };
    }
  }

  // Función helper para formatear números en guaraníes
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Función helper para formatear fechas relativas
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace menos de 1h';
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
