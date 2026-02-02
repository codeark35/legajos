import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  tablaAfectada: string;
  idRegistroAfectado: string;
  campoModificado: string;
  valorAnterior?: any;
  valorNuevo?: any;
  usuarioModificacion?: string;
  motivo?: string;
  ipAddress?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar un cambio en el historial de auditoría
   */
  async registrarCambio(data: AuditLogData) {
    try {
      return await this.prisma.historialCambio.create({
        data: {
          tablaAfectada: data.tablaAfectada,
          idRegistroAfectado: data.idRegistroAfectado,
          campoModificado: data.campoModificado,
          valorAnterior: this.serializeValue(data.valorAnterior),
          valorNuevo: this.serializeValue(data.valorNuevo),
          usuarioModificacion: data.usuarioModificacion,
          motivo: data.motivo,
          ipAddress: data.ipAddress,
        },
      });
    } catch (error) {
      // Log error pero no fallar la operación principal
      console.error('Error al registrar auditoría:', error);
    }
  }

  /**
   * Registrar cambio en el histórico mensual JSONB
   */
  async registrarCambioHistoricoMensual(
    asignacionId: string,
    anio: number,
    mes: number,
    datosAnteriores: any,
    datosNuevos: any,
    usuarioId?: string,
    ipAddress?: string,
  ) {
    const mesKey = mes.toString().padStart(2, '0');
    
    return this.registrarCambio({
      tablaAfectada: 'asignaciones_presupuestarias',
      idRegistroAfectado: asignacionId,
      campoModificado: `historicoMensual.${anio}.${mesKey}`,
      valorAnterior: datosAnteriores,
      valorNuevo: datosNuevos,
      usuarioModificacion: usuarioId,
      motivo: `Modificación de datos presupuestarios ${mesKey}/${anio}`,
      ipAddress,
    });
  }

  /**
   * Registrar eliminación de un mes del histórico
   */
  async registrarEliminacionMes(
    asignacionId: string,
    anio: number,
    mes: number,
    datosEliminados: any,
    usuarioId?: string,
    ipAddress?: string,
  ) {
    const mesKey = mes.toString().padStart(2, '0');
    
    return this.registrarCambio({
      tablaAfectada: 'asignaciones_presupuestarias',
      idRegistroAfectado: asignacionId,
      campoModificado: `historicoMensual.${anio}.${mesKey}`,
      valorAnterior: datosEliminados,
      valorNuevo: null,
      usuarioModificacion: usuarioId,
      motivo: `Eliminación de datos presupuestarios ${mesKey}/${anio}`,
      ipAddress,
    });
  }

  /**
   * Obtener historial de cambios de una asignación
   */
  async obtenerHistorialAsignacion(asignacionId: string, limite = 50) {
    return this.prisma.historialCambio.findMany({
      where: {
        tablaAfectada: 'asignaciones_presupuestarias',
        idRegistroAfectado: asignacionId,
      },
      orderBy: { fechaModificacion: 'desc' },
      take: limite,
    });
  }

  /**
   * Obtener historial de un mes específico
   */
  async obtenerHistorialMes(asignacionId: string, anio: number, mes: number) {
    const mesKey = mes.toString().padStart(2, '0');
    
    return this.prisma.historialCambio.findMany({
      where: {
        tablaAfectada: 'asignaciones_presupuestarias',
        idRegistroAfectado: asignacionId,
        campoModificado: {
          startsWith: `historicoMensual.${anio}.${mesKey}`,
        },
      },
      orderBy: { fechaModificacion: 'desc' },
    });
  }

  /**
   * Serializar valor para almacenamiento
   */
  private serializeValue(value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

  /**
   * Deserializar valor desde almacenamiento
   */
  deserializeValue(value: string | null): any {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
