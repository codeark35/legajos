import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { QueryPersonaDto } from './dto/query-persona.dto';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

@Injectable()
export class PersonasService {
  private readonly logger = new Logger(PersonasService.name);

  constructor(private prisma: PrismaService) {}

  async create(createPersonaDto: CreatePersonaDto) {
    this.logger.log(`Creando persona: ${createPersonaDto.nombres} ${createPersonaDto.apellidos}`);

    // Verificar si ya existe una persona con esa cédula
    const existing = await this.prisma.persona.findUnique({
      where: { numeroCedula: createPersonaDto.numeroCedula },
    });

    if (existing) {
      throw new ConflictException('Ya existe una persona con ese número de cédula');
    }

    const persona = await this.prisma.persona.create({
      data: {
        numeroCedula: createPersonaDto.numeroCedula,
        nombres: createPersonaDto.nombres,
        apellidos: createPersonaDto.apellidos,
        fechaNacimiento: createPersonaDto.fechaNacimiento
          ? new Date(createPersonaDto.fechaNacimiento)
          : null,
        direccion: createPersonaDto.direccion,
        telefono: createPersonaDto.telefono,
        email: createPersonaDto.email,
        estado: createPersonaDto.estado,
      },
    });

    this.logger.log(`Persona creada con ID: ${persona.id}`);
    return persona;
  }

  async findAll(query: QueryPersonaDto) {
    const { page = 1, limit = 10, sortBy = 'apellidos', sortOrder = 'asc', search, numeroCedula, estado } = query;

    const skip = calculateSkip(page, limit);
    const where: Prisma.PersonaWhereInput = {};

    if (search) {
      where.OR = [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (numeroCedula) {
      where.numeroCedula = { contains: numeroCedula };
    }

    if (estado) {
      where.estado = estado;
    }

    const [data, total] = await Promise.all([
      this.prisma.persona.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { legajos: true },
          },
        },
      }),
      this.prisma.persona.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        legajos: {
          include: {
            facultad: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return persona;
  }

  async findByCedula(numeroCedula: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { numeroCedula },
      include: {
        legajos: {
          include: {
            facultad: true,
          },
        },
      },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con cédula ${numeroCedula} no encontrada`);
    }

    return persona;
  }

  async update(id: string, updatePersonaDto: UpdatePersonaDto) {
    this.logger.log(`Actualizando persona: ${id}`);

    // Verificar que la persona existe
    await this.findOne(id);

    // Si se actualiza la cédula, verificar que no exista otra persona con esa cédula
    if (updatePersonaDto.numeroCedula) {
      const existing = await this.prisma.persona.findUnique({
        where: { numeroCedula: updatePersonaDto.numeroCedula },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra persona con ese número de cédula');
      }
    }

    const persona = await this.prisma.persona.update({
      where: { id },
      data: {
        ...updatePersonaDto,
        fechaNacimiento: updatePersonaDto.fechaNacimiento
          ? new Date(updatePersonaDto.fechaNacimiento)
          : undefined,
      },
    });

    this.logger.log(`Persona actualizada: ${id}`);
    return persona;
  }

  async remove(id: string) {
    this.logger.log(`Eliminando persona: ${id}`);

    // Verificar que existe
    await this.findOne(id);

    // Soft delete: cambiar estado a INACTIVO
    const persona = await this.prisma.persona.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    this.logger.log(`Persona marcada como inactiva: ${id}`);
    return persona;
  }

  async getStats() {
    const [total, activos, inactivos, suspendidos] = await Promise.all([
      this.prisma.persona.count(),
      this.prisma.persona.count({ where: { estado: 'ACTIVO' } }),
      this.prisma.persona.count({ where: { estado: 'INACTIVO' } }),
      this.prisma.persona.count({ where: { estado: 'SUSPENDIDO' } }),
    ]);

    return {
      total,
      activos,
      inactivos,
      suspendidos,
    };
  }
}
