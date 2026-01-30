import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNombramientoDto, CreateAsignacionSalarialDto } from './dto/create-nombramiento.dto';
import { UpdateNombramientoDto } from './dto/update-nombramiento.dto';
import { QueryNombramientoDto } from './dto/query-nombramiento.dto';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

@Injectable()
export class NombramientosService {
  private readonly logger = new Logger(NombramientosService.name);

  constructor(private prisma: PrismaService) {}

  async create(createNombramientoDto: CreateNombramientoDto) {
    this.logger.log(`Creando nombramiento para legajo: ${createNombramientoDto.legajoId}`);

    // Verificar que el legajo existe
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: createNombramientoDto.legajoId },
    });

    if (!legajo) {
      throw new NotFoundException('Legajo no encontrado');
    }

    // Validar fechas
    if (createNombramientoDto.fechaFin) {
      const fechaInicio = new Date(createNombramientoDto.fechaInicio);
      const fechaFin = new Date(createNombramientoDto.fechaFin);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    const nombramiento = await this.prisma.nombramiento.create({
      data: {
        legajoId: createNombramientoDto.legajoId,
        cargoId: createNombramientoDto.cargoId,
        tipoNombramiento: createNombramientoDto.tipoNombramiento,
        categoria: createNombramientoDto.categoria,
        fechaInicio: new Date(createNombramientoDto.fechaInicio),
        fechaFin: createNombramientoDto.fechaFin ? new Date(createNombramientoDto.fechaFin) : null,
        resolucionNumero: createNombramientoDto.resolucionNumero,
        resolucionFecha: createNombramientoDto.resolucionFecha
          ? new Date(createNombramientoDto.resolucionFecha)
          : null,
        resolucionId: createNombramientoDto.resolucionId,
        salarioMensual: createNombramientoDto.salarioMensual,
        moneda: createNombramientoDto.moneda || 'PYG',
        estadoNombramiento: createNombramientoDto.estadoNombramiento,
        observaciones: createNombramientoDto.observaciones,
      },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
        cargo: true,
      },
    });

    this.logger.log(`Nombramiento creado con ID: ${nombramiento.id}`);
    return nombramiento;
  }

  async findAll(query: QueryNombramientoDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'fechaInicio',
      sortOrder = 'desc',
      legajoId,
      estadoNombramiento,
      resolucionNumero,
      fechaDesde,
      fechaHasta,
      soloVigentes,
    } = query;

    const skip = calculateSkip(page, limit);
    const where: Prisma.NombramientoWhereInput = {};

    if (legajoId) {
      where.legajoId = legajoId;
    }

    if (estadoNombramiento) {
      where.estadoNombramiento = estadoNombramiento;
    }

    if (soloVigentes) {
      where.estadoNombramiento = 'VIGENTE';
    }

    if (resolucionNumero) {
      where.resolucionNumero = { contains: resolucionNumero, mode: 'insensitive' };
    }

    if (fechaDesde || fechaHasta) {
      where.fechaInicio = {};
      if (fechaDesde) {
        where.fechaInicio.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaInicio.lte = new Date(fechaHasta);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.nombramiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          legajo: {
            include: {
              persona: true,
              facultad: true,
            },
          },
          cargo: true,
          _count: {
            select: {
              asignacionesSalariales: true,
            },
          },
        },
      }),
      this.prisma.nombramiento.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
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
        resolucion: true,
        asignacionesSalariales: {
          orderBy: { fechaDesde: 'desc' },
        },
      },
    });

    if (!nombramiento) {
      throw new NotFoundException(`Nombramiento con ID ${id} no encontrado`);
    }

    return nombramiento;
  }

  async findByLegajo(legajoId: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: legajoId },
    });

    if (!legajo) {
      throw new NotFoundException('Legajo no encontrado');
    }

    const nombramientos = await this.prisma.nombramiento.findMany({
      where: { legajoId },
      include: {
        cargo: true,
        asignacionesSalariales: true,
      },
      orderBy: { fechaInicio: 'desc' },
    });

    return nombramientos;
  }

  async findVigentes() {
    const nombramientos = await this.prisma.nombramiento.findMany({
      where: {
        estadoNombramiento: 'VIGENTE',
      },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
        cargo: true,
      },
      orderBy: { fechaInicio: 'desc' },
    });

    return nombramientos;
  }

  async update(id: string, updateNombramientoDto: UpdateNombramientoDto) {
    this.logger.log(`Actualizando nombramiento: ${id}`);

    await this.findOne(id);

    // Validar fechas si se actualizan
    if (updateNombramientoDto.fechaInicio || updateNombramientoDto.fechaFin) {
      const current = await this.prisma.nombramiento.findUnique({ where: { id } });
      const fechaInicio = updateNombramientoDto.fechaInicio
        ? new Date(updateNombramientoDto.fechaInicio)
        : current.fechaInicio;
      const fechaFin = updateNombramientoDto.fechaFin
        ? new Date(updateNombramientoDto.fechaFin)
        : current.fechaFin;

      if (fechaFin && fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    const nombramiento = await this.prisma.nombramiento.update({
      where: { id },
      data: {
        ...updateNombramientoDto,
        fechaInicio: updateNombramientoDto.fechaInicio
          ? new Date(updateNombramientoDto.fechaInicio)
          : undefined,
        fechaFin: updateNombramientoDto.fechaFin
          ? new Date(updateNombramientoDto.fechaFin)
          : undefined,
        resolucionFecha: updateNombramientoDto.resolucionFecha
          ? new Date(updateNombramientoDto.resolucionFecha)
          : undefined,
      },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
        cargo: true,
      },
    });

    this.logger.log(`Nombramiento actualizado: ${id}`);
    return nombramiento;
  }

  async finalizarNombramiento(id: string, fechaFin?: string) {
    this.logger.log(`Finalizando nombramiento: ${id}`);

    await this.findOne(id);

    const nombramiento = await this.prisma.nombramiento.update({
      where: { id },
      data: {
        estadoNombramiento: 'FINALIZADO',
        fechaFin: fechaFin ? new Date(fechaFin) : new Date(),
      },
    });

    this.logger.log(`Nombramiento finalizado: ${id}`);
    return nombramiento;
  }

  async agregarAsignacionSalarial(nombramientoId: string, createAsignacionDto: CreateAsignacionSalarialDto) {
    this.logger.log(`Agregando asignación salarial al nombramiento: ${nombramientoId}`);

    // Verificar que el nombramiento existe
    await this.findOne(nombramientoId);

    // Validar fechas
    if (createAsignacionDto.fechaHasta) {
      const fechaDesde = new Date(createAsignacionDto.fechaDesde);
      const fechaHasta = new Date(createAsignacionDto.fechaHasta);

      if (fechaHasta <= fechaDesde) {
        throw new BadRequestException('La fecha hasta debe ser posterior a la fecha desde');
      }
    }

    const asignacion = await this.prisma.asignacionSalarial.create({
      data: {
        nombramientoId,
        categoriaPresupuestaria: createAsignacionDto.categoriaPresupuestaria,
        monto: createAsignacionDto.monto,
        moneda: createAsignacionDto.moneda || 'PYG',
        fechaDesde: new Date(createAsignacionDto.fechaDesde),
        fechaHasta: createAsignacionDto.fechaHasta
          ? new Date(createAsignacionDto.fechaHasta)
          : null,
        descripcion: createAsignacionDto.descripcion,
      },
    });

    this.logger.log(`Asignación salarial creada: ${asignacion.id}`);
    return asignacion;
  }

  async getStats() {
    const [total, vigentes, finalizados, suspendidos, cancelados] = await Promise.all([
      this.prisma.nombramiento.count(),
      this.prisma.nombramiento.count({ where: { estadoNombramiento: 'VIGENTE' } }),
      this.prisma.nombramiento.count({ where: { estadoNombramiento: 'FINALIZADO' } }),
      this.prisma.nombramiento.count({ where: { estadoNombramiento: 'SUSPENDIDO' } }),
      this.prisma.nombramiento.count({ where: { estadoNombramiento: 'CANCELADO' } }),
    ]);

    return {
      total,
      porEstado: {
        vigentes,
        finalizados,
        suspendidos,
        cancelados,
      },
    };
  }
}
