import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionPresupuestariaDto } from './dto/create-asignacion-presupuestaria.dto';
import { UpdateAsignacionPresupuestariaDto } from './dto/update-asignacion-presupuestaria.dto';
import { HistoricoMensualDto } from './dto/historico-mensual.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';

@Injectable()
export class AsignacionesPresupuestariasService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionPresupuestariaDto) {
    // Verificar que el nombramiento existe y no tiene ya una asignación
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: createDto.nombramientoId },
      include: { asignacionPresupuestaria: true },
    });

    if (!nombramiento) {
      throw new NotFoundException('El nombramiento no existe');
    }

    if (nombramiento.asignacionPresupuestaria) {
      throw new ConflictException(
        'El nombramiento ya tiene una asignación presupuestaria',
      );
    }

    const data: any = {
      nombramiento: { connect: { id: createDto.nombramientoId } },
      salarioBase: createDto.salarioBase,
      moneda: createDto.moneda || 'PYG',
      historicoMensual: {},
    };

    if (createDto.categoriaPresupuestariaId) {
      data.categoriaPresupuestaria = {
        connect: { id: createDto.categoriaPresupuestariaId },
      };
    }

    if (createDto.lineaPresupuestariaId) {
      data.lineaPresupuestaria = {
        connect: { id: createDto.lineaPresupuestariaId },
      };
    }

    if (createDto.objetoGasto) {
      data.objetoGasto = createDto.objetoGasto;
    }

    return this.prisma.asignacionPresupuestaria.create({
      data,
      include: {
        nombramiento: {
          include: {
            legajo: {
              include: {
                persona: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    numeroCedula: true,
                  },
                },
              },
            },
            cargo: true,
          },
        },
        categoriaPresupuestaria: true,
        lineaPresupuestaria: true,
      },
    });
  }

  async findAll() {
    return this.prisma.asignacionPresupuestaria.findMany({
      include: {
        nombramiento: {
          include: {
            legajo: {
              include: {
                persona: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    numeroCedula: true,
                  },
                },
              },
            },
            cargo: true,
          },
        },
        categoriaPresupuestaria: true,
        lineaPresupuestaria: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const asignacion =
      await this.prisma.asignacionPresupuestaria.findUnique({
        where: { id },
        include: {
          nombramiento: {
            include: {
              legajo: {
                include: {
                  persona: true,
                  facultad: true,
                },
              },
              cargo: true,
            },
          },
          categoriaPresupuestaria: true,
          lineaPresupuestaria: true,
        },
      });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación presupuestaria con ID ${id} no encontrada`,
      );
    }

    return asignacion;
  }

  async update(id: string, updateDto: UpdateAsignacionPresupuestariaDto) {
    await this.findOne(id);

    const data: any = {};

    if (updateDto.salarioBase !== undefined) {
      data.salarioBase = updateDto.salarioBase;
    }

    if (updateDto.moneda) {
      data.moneda = updateDto.moneda;
    }

    if (updateDto.objetoGasto !== undefined) {
      data.objetoGasto = updateDto.objetoGasto;
    }

    if (updateDto.categoriaPresupuestariaId) {
      data.categoriaPresupuestaria = {
        connect: { id: updateDto.categoriaPresupuestariaId },
      };
    }

    if (updateDto.lineaPresupuestariaId) {
      data.lineaPresupuestaria = {
        connect: { id: updateDto.lineaPresupuestariaId },
      };
    }

    return this.prisma.asignacionPresupuestaria.update({
      where: { id },
      data,
      include: {
        nombramiento: true,
        categoriaPresupuestaria: true,
        lineaPresupuestaria: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.asignacionPresupuestaria.delete({ where: { id } });
  }

  // ============================================================================
  // MÉTODOS PARA HISTÓRICO MENSUAL JSONB
  // ============================================================================

  /**
   * Agregar o actualizar datos de un mes específico en el histórico
   */
  async agregarMes(
    id: string,
    anio: number,
    mes: number,
    datos: HistoricoMensualDto,
    usuarioId?: string,
    ipAddress?: string,
  ) {
    // Validar año y mes
    this.validarAnioMes(anio, mes);

    const asignacion = await this.findOne(id);
    const historico = (asignacion.historicoMensual as any) || {};

    // Crear estructura si no existe
    if (!historico[anio]) {
      historico[anio] = {};
    }

    // Formatear mes con cero a la izquierda
    const mesKey = mes.toString().padStart(2, '0');

    // Guardar datos anteriores para auditoría
    const datosAnteriores = historico[anio][mesKey] || null;

    // Agregar o actualizar el mes
    historico[anio][mesKey] = {
      presupuestado: datos.presupuestado,
      devengado: datos.devengado,
      aportesPatronales: datos.aportesPatronales || 0,
      aportesPersonales: datos.aportesPersonales || 0,
      observaciones: datos.observaciones || '',
      fechaRegistro: new Date().toISOString(),
    };

    const resultado = await this.prisma.asignacionPresupuestaria.update({
      where: { id },
      data: {
        historicoMensual: historico,
        fechaUltimaActualizacion: new Date(),
      },
      include: {
        nombramiento: {
          include: {
            legajo: {
              include: {
                persona: {
                  select: {
                    nombres: true,
                    apellidos: true,
                  },
                },
              },
            },
            cargo: true,
          },
        },
      },
    });

    // Registrar en auditoría
    await this.auditoria.registrarCambioHistoricoMensual(
      id,
      anio,
      mes,
      datosAnteriores,
      historico[anio][mesKey],
      usuarioId,
      ipAddress,
    );

    return resultado;
  }

  /**
   * Obtener el histórico completo de una asignación
   */
  async obtenerHistorico(id: string) {
    const asignacion = await this.findOne(id);
    return {
      asignacion: {
        id: asignacion.id,
        salarioBase: asignacion.salarioBase,
        moneda: asignacion.moneda,
        persona: asignacion.nombramiento.legajo.persona,
        cargo: asignacion.nombramiento.cargo,
      },
      historico: asignacion.historicoMensual || {},
    };
  }

  /**
   * Obtener datos de un mes específico
   */
  async obtenerMes(id: string, anio: number, mes: number) {
    this.validarAnioMes(anio, mes);

    const asignacion = await this.findOne(id);
    const historico = (asignacion.historicoMensual as any) || {};
    const mesKey = mes.toString().padStart(2, '0');

    if (!historico[anio] || !historico[anio][mesKey]) {
      throw new NotFoundException(
        `No hay datos registrados para ${mesKey}/${anio}`,
      );
    }

    return {
      anio,
      mes: mesKey,
      datos: historico[anio][mesKey],
      persona: asignacion.nombramiento.legajo.persona,
    };
  }

  /**
   * Eliminar un mes del histórico
   */
  async eliminarMes(
    id: string,
    anio: number,
    mes: number,
    usuarioId?: string,
    ipAddress?: string,
  ) {
    this.validarAnioMes(anio, mes);

    const asignacion = await this.findOne(id);
    const historico = (asignacion.historicoMensual as any) || {};
    const mesKey = mes.toString().padStart(2, '0');

    if (!historico[anio] || !historico[anio][mesKey]) {
      throw new NotFoundException(
        `No hay datos para eliminar en ${mesKey}/${anio}`,
      );
    }

    // Guardar datos eliminados para auditoría
    const datosEliminados = historico[anio][mesKey];

    delete historico[anio][mesKey];

    // Si el año queda vacío, eliminarlo también
    if (Object.keys(historico[anio]).length === 0) {
      delete historico[anio];
    }

    const resultado = await this.prisma.asignacionPresupuestaria.update({
      where: { id },
      data: {
        historicoMensual: historico,
        fechaUltimaActualizacion: new Date(),
      },
    });

    // Registrar eliminación en auditoría
    await this.auditoria.registrarEliminacionMes(
      id,
      anio,
      mes,
      datosEliminados,
      usuarioId,
      ipAddress,
    );

    return resultado;
  }

  /**
   * Obtener resumen anual
   */
  async obtenerResumenAnual(id: string, anio: number) {
    if (anio < 2000 || anio > 2100) {
      throw new BadRequestException('Año inválido');
    }

    const asignacion = await this.findOne(id);
    const historico = (asignacion.historicoMensual as any) || {};

    if (!historico[anio]) {
      return {
        anio,
        meses: [],
        totalPresupuestado: 0,
        totalDevengado: 0,
        totalAportesPatronales: 0,
        totalAportesPersonales: 0,
      };
    }

    const meses = Object.keys(historico[anio]).sort();
    let totales = {
      presupuestado: 0,
      devengado: 0,
      aportesPatronales: 0,
      aportesPersonales: 0,
    };

    meses.forEach((mes) => {
      const datos = historico[anio][mes];
      totales.presupuestado += datos.presupuestado || 0;
      totales.devengado += datos.devengado || 0;
      totales.aportesPatronales += datos.aportesPatronales || 0;
      totales.aportesPersonales += datos.aportesPersonales || 0;
    });

    return {
      anio,
      meses: meses.map((mes) => ({
        mes,
        ...historico[anio][mes],
      })),
      totalPresupuestado: totales.presupuestado,
      totalDevengado: totales.devengado,
      totalAportesPatronales: totales.aportesPatronales,
      totalAportesPersonales: totales.aportesPersonales,
      persona: asignacion.nombramiento.legajo.persona,
    };
  }

  /**
   * Validar año y mes
   */
  private validarAnioMes(anio: number, mes: number) {
    if (anio < 2000 || anio > 2100) {
      throw new BadRequestException('Año debe estar entre 2000 y 2100');
    }

    if (mes < 1 || mes > 12) {
      throw new BadRequestException('Mes debe estar entre 1 y 12');
    }
  }

  /**
   * Obtener historial de auditoría de una asignación
   */
  async obtenerHistorialAuditoria(id: string) {
    await this.findOne(id); // Verificar que existe
    return this.auditoria.obtenerHistorialAsignacion(id);
  }

  /**
   * Obtener historial de auditoría de un mes específico
   */
  async obtenerHistorialMesAuditoria(id: string, anio: number, mes: number) {
    this.validarAnioMes(anio, mes);
    await this.findOne(id);
    return this.auditoria.obtenerHistorialMes(id, anio, mes);
  }
}
