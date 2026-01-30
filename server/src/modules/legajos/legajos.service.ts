import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLegajoDto } from './dto/create-legajo.dto';
import { UpdateLegajoDto } from './dto/update-legajo.dto';
import { QueryLegajoDto } from './dto/query-legajo.dto';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

@Injectable()
export class LegajosService {
  private readonly logger = new Logger(LegajosService.name);

  constructor(private prisma: PrismaService) {}

  async create(createLegajoDto: CreateLegajoDto) {
    this.logger.log(`Creando legajo para persona: ${createLegajoDto.personaId}`);

    // Verificar que la persona existe
    const persona = await this.prisma.persona.findUnique({
      where: { id: createLegajoDto.personaId },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    // Verificar si la facultad existe (si se proporciona)
    if (createLegajoDto.facultadId) {
      const facultad = await this.prisma.facultad.findUnique({
        where: { id: createLegajoDto.facultadId },
      });

      if (!facultad) {
        throw new NotFoundException('Facultad no encontrada');
      }
    }

    // Verificar si ya existe un legajo activo del mismo tipo para esta persona
    const existingLegajo = await this.prisma.legajo.findFirst({
      where: {
        personaId: createLegajoDto.personaId,
        tipoLegajo: createLegajoDto.tipoLegajo,
        estadoLegajo: 'ACTIVO',
      },
    });

    if (existingLegajo) {
      throw new ConflictException(
        `La persona ya tiene un legajo activo de tipo ${createLegajoDto.tipoLegajo}`,
      );
    }

    // Generar número de legajo automático
    const numeroLegajo = await this.generateNumeroLegajo();

    const legajo = await this.prisma.legajo.create({
      data: {
        numeroLegajo,
        personaId: createLegajoDto.personaId,
        tipoLegajo: createLegajoDto.tipoLegajo,
        facultadId: createLegajoDto.facultadId,
        fechaApertura: createLegajoDto.fechaApertura
          ? new Date(createLegajoDto.fechaApertura)
          : new Date(),
        estadoLegajo: createLegajoDto.estadoLegajo,
        observaciones: createLegajoDto.observaciones,
      },
      include: {
        persona: true,
        facultad: true,
      },
    });

    this.logger.log(`Legajo creado: ${numeroLegajo}`);
    return legajo;
  }

  async findAll(query: QueryLegajoDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      numeroLegajo,
      personaId,
      tipoLegajo,
      estadoLegajo,
      facultadId,
    } = query;

    const skip = calculateSkip(page, limit);
    const where: Prisma.LegajoWhereInput = {};

    if (numeroLegajo) {
      where.numeroLegajo = { contains: numeroLegajo, mode: 'insensitive' };
    }

    if (personaId) {
      where.personaId = personaId;
    }

    if (tipoLegajo) {
      where.tipoLegajo = tipoLegajo;
    }

    if (estadoLegajo) {
      where.estadoLegajo = estadoLegajo;
    }

    if (facultadId) {
      where.facultadId = facultadId;
    }

    const [data, total] = await Promise.all([
      this.prisma.legajo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          persona: true,
          facultad: true,
          _count: {
            select: {
              nombramientos: true,
              documentos: true,
            },
          },
        },
      }),
      this.prisma.legajo.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id },
      include: {
        persona: true,
        facultad: true,
        nombramientos: {
          include: {
            cargo: true,
            asignacionesSalariales: true,
          },
          orderBy: { fechaInicio: 'desc' },
        },
        documentos: {
          orderBy: { fechaCarga: 'desc' },
        },
      },
    });

    if (!legajo) {
      throw new NotFoundException(`Legajo con ID ${id} no encontrado`);
    }

    return legajo;
  }

  async findByNumero(numeroLegajo: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { numeroLegajo },
      include: {
        persona: true,
        facultad: true,
        nombramientos: {
          include: {
            cargo: true,
          },
        },
      },
    });

    if (!legajo) {
      throw new NotFoundException(`Legajo ${numeroLegajo} no encontrado`);
    }

    return legajo;
  }

  async findByPersona(personaId: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const legajos = await this.prisma.legajo.findMany({
      where: { personaId },
      include: {
        facultad: true,
        _count: {
          select: {
            nombramientos: true,
            documentos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return legajos;
  }

  async update(id: string, updateLegajoDto: UpdateLegajoDto) {
    this.logger.log(`Actualizando legajo: ${id}`);

    // Verificar que el legajo existe
    await this.findOne(id);

    // Verificar facultad si se actualiza
    if (updateLegajoDto.facultadId) {
      const facultad = await this.prisma.facultad.findUnique({
        where: { id: updateLegajoDto.facultadId },
      });

      if (!facultad) {
        throw new NotFoundException('Facultad no encontrada');
      }
    }

    const legajo = await this.prisma.legajo.update({
      where: { id },
      data: {
        ...updateLegajoDto,
        fechaApertura: updateLegajoDto.fechaApertura
          ? new Date(updateLegajoDto.fechaApertura)
          : undefined,
      },
      include: {
        persona: true,
        facultad: true,
      },
    });

    this.logger.log(`Legajo actualizado: ${id}`);
    return legajo;
  }

  async changeEstado(id: string, nuevoEstado: string) {
    this.logger.log(`Cambiando estado de legajo ${id} a ${nuevoEstado}`);

    const validEstados = ['ACTIVO', 'CERRADO', 'SUSPENDIDO', 'ARCHIVADO'];

    if (!validEstados.includes(nuevoEstado)) {
      throw new BadRequestException(`Estado inválido. Debe ser uno de: ${validEstados.join(', ')}`);
    }

    await this.findOne(id);

    const legajo = await this.prisma.legajo.update({
      where: { id },
      data: { estadoLegajo: nuevoEstado as any },
      include: {
        persona: true,
        facultad: true,
      },
    });

    this.logger.log(`Estado del legajo ${id} cambiado a ${nuevoEstado}`);
    return legajo;
  }

  async remove(id: string) {
    this.logger.log(`Archivando legajo: ${id}`);

    await this.findOne(id);

    const legajo = await this.prisma.legajo.update({
      where: { id },
      data: { estadoLegajo: 'ARCHIVADO' },
    });

    this.logger.log(`Legajo archivado: ${id}`);
    return legajo;
  }

  async getStats() {
    const [total, activos, cerrados, suspendidos, archivados, porTipo] = await Promise.all([
      this.prisma.legajo.count(),
      this.prisma.legajo.count({ where: { estadoLegajo: 'ACTIVO' } }),
      this.prisma.legajo.count({ where: { estadoLegajo: 'CERRADO' } }),
      this.prisma.legajo.count({ where: { estadoLegajo: 'SUSPENDIDO' } }),
      this.prisma.legajo.count({ where: { estadoLegajo: 'ARCHIVADO' } }),
      this.prisma.legajo.groupBy({
        by: ['tipoLegajo'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      porEstado: {
        activos,
        cerrados,
        suspendidos,
        archivados,
      },
      porTipo: porTipo.map((item) => ({
        tipo: item.tipoLegajo,
        cantidad: item._count._all,
      })),
    };
  }

  /**
   * Generar número de legajo automático: LEG-YYYY-####
   */
  private async generateNumeroLegajo(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LEG-${year}`;

    const lastLegajo = await this.prisma.legajo.findFirst({
      where: {
        numeroLegajo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        numeroLegajo: 'desc',
      },
      select: {
        numeroLegajo: true,
      },
    });

    let nextNumber = 1;

    if (lastLegajo) {
      const lastNumber = parseInt(lastLegajo.numeroLegajo.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  }
}
