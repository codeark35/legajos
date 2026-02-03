import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNombramientoAsignacionDto } from './dto/create-nombramiento-asignacion.dto';
import { UpdateHistoricoMensualDto } from './dto/update-historico-mensual.dto';
import { FinalizarAsignacionDto } from './dto/finalizar-asignacion.dto';

@Injectable()
export class NombramientoAsignacionesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDto: CreateNombramientoAsignacionDto,
    usuarioCarga?: string,
  ) {
    // Verificar que el nombramiento existe
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: createDto.nombramientoId },
    });
    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    // Verificar que la asignación existe
    const asignacion = await this.prisma.asignacionPresupuestaria.findUnique({
      where: { id: createDto.asignacionPresupuestariaId },
    });
    if (!asignacion) {
      throw new NotFoundException('Asignación presupuestaria no encontrada');
    }

    if (!asignacion.vigente) {
      throw new BadRequestException('La asignación presupuestaria no está vigente');
    }

    // Validar fechas
    const fechaInicio = new Date(createDto.fechaInicio);
    if (createDto.fechaFin) {
      const fechaFin = new Date(createDto.fechaFin);
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio',
        );
      }
    }

    // Verificar que no haya solapamiento de fechas para el mismo nombramiento
    const asignacionesExistentes =
      await this.prisma.nombramientoAsignacion.findMany({
        where: {
          nombramientoId: createDto.nombramientoId,
          OR: [
            {
              // Asignación sin fecha fin (vigente)
              fechaFin: null,
            },
            {
              // Asignación que se solapa con la nueva
              AND: [
                { fechaInicio: { lte: new Date(createDto.fechaFin || '9999-12-31') } },
                {
                  OR: [
                    { fechaFin: null },
                    { fechaFin: { gte: fechaInicio } },
                  ],
                },
              ],
            },
          ],
        },
      });

    if (asignacionesExistentes.length > 0) {
      throw new BadRequestException(
        'Ya existe una asignación vigente para este nombramiento en el período especificado',
      );
    }

    // Crear la asignación
    return this.prisma.nombramientoAsignacion.create({
      data: {
        nombramientoId: createDto.nombramientoId,
        asignacionPresupuestariaId: createDto.asignacionPresupuestariaId,
        fechaInicio: fechaInicio,
        fechaFin: createDto.fechaFin ? new Date(createDto.fechaFin) : null,
        observaciones: createDto.observaciones,
        usuarioCarga: usuarioCarga || 'SISTEMA',
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
                    numeroCedula: true,
                  },
                },
              },
            },
            cargo: true,
          },
        },
        asignacionPresupuestaria: {
          include: {
            categoriaPresupuestaria: true,
            lineaPresupuestaria: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.nombramientoAsignacion.findMany({
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
        asignacionPresupuestaria: {
          include: {
            categoriaPresupuestaria: true,
            lineaPresupuestaria: true,
          },
        },
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findOne(id: string) {
    const asignacion = await this.prisma.nombramientoAsignacion.findUnique({
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
        asignacionPresupuestaria: {
          include: {
            categoriaPresupuestaria: true,
            lineaPresupuestaria: true,
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    return asignacion;
  }

  async findByNombramiento(nombramientoId: string) {
    return this.prisma.nombramientoAsignacion.findMany({
      where: { nombramientoId },
      include: {
        asignacionPresupuestaria: {
          include: {
            categoriaPresupuestaria: true,
            lineaPresupuestaria: true,
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async findByAsignacion(asignacionPresupuestariaId: string) {
    return this.prisma.nombramientoAsignacion.findMany({
      where: { asignacionPresupuestariaId },
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
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findByAsignacionAndMonth(
    asignacionPresupuestariaId: string,
    anio: number,
    mes: number,
  ) {
    const mesKey = `${anio}-${mes.toString().padStart(2, '0')}`;
    
    const asignaciones = await this.prisma.nombramientoAsignacion.findMany({
      where: {
        asignacionPresupuestariaId,
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
                    numeroCedula: true,
                  },
                },
              },
            },
            cargo: true,
          },
        },
      },
    });

    // Filtrar las que tienen datos para ese mes
    return asignaciones.filter((asig) => {
      const historico = asig.historicoMensual as any;
      return historico && historico[mesKey];
    }).map((asig) => ({
      ...asig,
      datosMes: (asig.historicoMensual as any)[mesKey],
    }));
  }

  async updateHistoricoMensual(
    id: string,
    updateDto: UpdateHistoricoMensualDto,
  ) {
    const asignacion = await this.prisma.nombramientoAsignacion.findUnique({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Validar mes
    if (updateDto.mes < 1 || updateDto.mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    const historico = (asignacion.historicoMensual as any) || {};
    const mesKey = `${updateDto.anio}-${updateDto.mes.toString().padStart(2, '0')}`;

    // Calcular neto recibido si no viene
    const devengado = updateDto.devengado || updateDto.presupuestado;
    const aportesPersonales = updateDto.aportesPersonales || 0;
    const descuentos = updateDto.descuentos || 0;
    const netoRecibido = updateDto.netoRecibido || 
      (devengado - aportesPersonales - descuentos);

    historico[mesKey] = {
      presupuestado: updateDto.presupuestado,
      devengado: devengado,
      aportesPatronales: updateDto.aportesPatronales || 0,
      aportesPersonales: aportesPersonales,
      descuentos: descuentos,
      netoRecibido: netoRecibido,
      observaciones: updateDto.observaciones || null,
      fechaActualizacion: new Date().toISOString(),
    };

    return this.prisma.nombramientoAsignacion.update({
      where: { id },
      data: { historicoMensual: historico },
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
          },
        },
        asignacionPresupuestaria: true,
      },
    });
  }

  async getHistoricoMensual(id: string, anio?: number, mes?: number) {
    const asignacion = await this.findOne(id);
    const historico = (asignacion.historicoMensual as any) || {};

    if (anio && mes) {
      const mesKey = `${anio}-${mes.toString().padStart(2, '0')}`;
      return {
        mes: mesKey,
        datos: historico[mesKey] || null,
      };
    }

    if (anio) {
      const anioKey = anio.toString();
      const mesesDelAnio = Object.keys(historico)
        .filter((key) => key.startsWith(anioKey))
        .reduce((acc: Record<string, any>, key) => {
          acc[key] = historico[key];
          return acc;
        }, {});
      return mesesDelAnio;
    }

    return historico;
  }

  async finalizar(id: string, finalizarDto: FinalizarAsignacionDto) {
    const asignacion = await this.findOne(id);

    const fechaFin = new Date(finalizarDto.fechaFin);
    const fechaInicio = new Date(asignacion.fechaInicio);

    if (fechaFin < fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    }

    return this.prisma.nombramientoAsignacion.update({
      where: { id },
      data: { fechaFin: fechaFin },
      include: {
        nombramiento: {
          include: {
            legajo: {
              include: {
                persona: true,
              },
            },
          },
        },
        asignacionPresupuestaria: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.nombramientoAsignacion.delete({
      where: { id },
    });
  }
}
