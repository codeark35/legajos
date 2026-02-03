import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNombramientoDto } from './dto/create-nombramiento.dto';
import { UpdateNombramientoDto } from './dto/update-nombramiento.dto';
import { QueryNombramientosDto } from './dto/query-nombramientos.dto';

@Injectable()
export class NombramientosService {
  constructor(private prisma: PrismaService) {}

  async create(createNombramientoDto: CreateNombramientoDto) {
    // Verificar que el legajo existe
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: createNombramientoDto.legajoId },
    });
    if (!legajo) {
      throw new BadRequestException('El legajo especificado no existe');
    }

    // Verificar que el cargo existe
    const cargo = await this.prisma.cargo.findUnique({
      where: { id: createNombramientoDto.cargoId },
    });
    if (!cargo) {
      throw new BadRequestException('El cargo especificado no existe');
    }

    // Validar fechas
    const fechaInicio = new Date(createNombramientoDto.fechaInicio);
    if (createNombramientoDto.fechaFin) {
      const fechaFin = new Date(createNombramientoDto.fechaFin);
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio',
        );
      }
    }

    const data: any = {
      legajo: { connect: { id: createNombramientoDto.legajoId } },
      cargo: { connect: { id: createNombramientoDto.cargoId } },
      fechaInicio: new Date(createNombramientoDto.fechaInicio),
      vigente: createNombramientoDto.vigente ?? true,
    };

    if (createNombramientoDto.fechaFin) {
      data.fechaFin = new Date(createNombramientoDto.fechaFin);
    }

    if (createNombramientoDto.observaciones) {
      data.observaciones = createNombramientoDto.observaciones;
    }

    return this.prisma.nombramiento.create({
      data,
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
            facultad: {
              select: {
                nombreFacultad: true,
              },
            },
          },
        },
        cargo: true,
      },
    });
  }

  async findAll(query: QueryNombramientosDto) {
    const { page = 1, limit = 10, search, legajoId, cargoId, vigente } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (legajoId) {
      where.legajoId = legajoId;
    }

    if (cargoId) {
      where.cargoId = cargoId;
    }

    if (vigente !== undefined) {
      where.vigente = vigente;
    }

    if (search) {
      where.observaciones = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.nombramiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaInicio: 'desc' },
        include: {
          legajo: {
            include: {
              persona: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  numeroCedula: true,
                },
              },
              facultad: {
                select: {
                  id: true,
                  nombreFacultad: true,
                },
              },
            },
          },
          cargo: true,
        },
      }),
      this.prisma.nombramiento.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findSinAsignacion() {
    const nombramientos = await this.prisma.nombramiento.findMany({
      where: {
      },
      orderBy: { fechaInicio: 'desc' },
      include: {
        legajo: {
          include: {
            persona: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                numeroCedula: true,
              },
            },
            facultad: {
              select: {
                id: true,
                nombreFacultad: true,
              },
            },
          },
        },
        cargo: true,
      },
    });

    return nombramientos;
  }

  async findOne(id: string) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id },
      include: {
        legajo: {
          include: {
            persona: true,
            facultad: true,
          },
        },
        cargo: true,
        asignaciones: {
          include: {
            asignacionPresupuestaria: {
              include: {
                categoriaPresupuestaria: true,
                lineaPresupuestaria: true,
              },
            },
          },
        },
      },
    });

    if (!nombramiento) {
      throw new NotFoundException(
        `Nombramiento con ID ${id} no encontrado`,
      );
    }

    return nombramiento;
  }

  async update(id: string, updateNombramientoDto: UpdateNombramientoDto) {
    // Verificar que existe
    await this.findOne(id);

    // Validar fechas si se proporcionan ambas
    if (updateNombramientoDto.fechaInicio && updateNombramientoDto.fechaFin) {
      const fechaInicio = new Date(updateNombramientoDto.fechaInicio);
      const fechaFin = new Date(updateNombramientoDto.fechaFin);
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio',
        );
      }
    }

    const data: any = {};

    if (updateNombramientoDto.legajoId) {
      const legajo = await this.prisma.legajo.findUnique({
        where: { id: updateNombramientoDto.legajoId },
      });
      if (!legajo) {
        throw new BadRequestException('El legajo especificado no existe');
      }
      data.legajo = { connect: { id: updateNombramientoDto.legajoId } };
    }

    if (updateNombramientoDto.cargoId) {
      const cargo = await this.prisma.cargo.findUnique({
        where: { id: updateNombramientoDto.cargoId },
      });
      if (!cargo) {
        throw new BadRequestException('El cargo especificado no existe');
      }
      data.cargo = { connect: { id: updateNombramientoDto.cargoId } };
    }

    if (updateNombramientoDto.fechaInicio) {
      data.fechaInicio = new Date(updateNombramientoDto.fechaInicio);
    }

    if (updateNombramientoDto.fechaFin) {
      data.fechaFin = new Date(updateNombramientoDto.fechaFin);
    }

    if (updateNombramientoDto.vigente !== undefined) {
      data.vigente = updateNombramientoDto.vigente;
    }

    if (updateNombramientoDto.observaciones !== undefined) {
      data.observaciones = updateNombramientoDto.observaciones;
    }

    return this.prisma.nombramiento.update({
      where: { id },
      data,
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
            facultad: {
              select: {
                nombreFacultad: true,
              },
            },
          },
        },
        cargo: true,
      },
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.nombramiento.delete({
      where: { id },
    });
  }

  async obtenerHistoricoAsignaciones(nombramientoId: string) {
    // Verificar que el nombramiento existe
    await this.findOne(nombramientoId);

    const asignaciones = await this.prisma.nombramientoAsignacion.findMany({
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

    // Agrupar períodos consecutivos con la misma asignación
    const periodos = [];
    let periodoActual = null;

    for (const asig of asignaciones) {
      if (
        !periodoActual ||
        periodoActual.asignacionId !== asig.asignacionPresupuestariaId
      ) {
        // Guardar período anterior si existe
        if (periodoActual) periodos.push(periodoActual);

        // Iniciar nuevo período
        periodoActual = {
          asignacionId: asig.asignacionPresupuestariaId,
          codigo: asig.asignacionPresupuestaria.codigo,
          descripcion: asig.asignacionPresupuestaria.descripcion,
          categoria: asig.asignacionPresupuestaria.categoriaPresupuestaria
            ?.codigoCategoria,
          categoriaDescripcion: asig.asignacionPresupuestaria
            .categoriaPresupuestaria?.descripcion,
          linea: asig.asignacionPresupuestaria.lineaPresupuestaria?.codigoLinea,
          lineaDescripcion: asig.asignacionPresupuestaria.lineaPresupuestaria
            ?.descripcion,
          fechaInicio: asig.fechaInicio,
          fechaFin: asig.fechaFin,
          salarioBase: asig.asignacionPresupuestaria.salarioBase,
          moneda: asig.asignacionPresupuestaria.moneda,
          historicoMensual: asig.historicoMensual,
        };
      } else {
        // Extender período actual
        periodoActual.fechaFin = asig.fechaFin;
        // Combinar históricos mensuales
        const historicoActual = periodoActual.historicoMensual as any;
        const historicoNuevo = asig.historicoMensual as any;
        periodoActual.historicoMensual = {
          ...historicoActual,
          ...historicoNuevo,
        };
      }
    }

    // Agregar último período
    if (periodoActual) periodos.push(periodoActual);

    return {
      nombramientoId,
      periodos,
      totalPeriodos: periodos.length,
    };
  }
}

