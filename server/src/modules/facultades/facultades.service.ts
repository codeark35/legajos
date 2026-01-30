import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';
import { QueryFacultadDto } from './dto/query-facultad.dto';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

@Injectable()
export class FacultadesService {
  private readonly logger = new Logger(FacultadesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createFacultadDto: CreateFacultadDto) {
    this.logger.log(`Creando facultad: ${createFacultadDto.nombreFacultad}`);

    // Verificar si ya existe una facultad con ese código (si se proporciona)
    if (createFacultadDto.codigo) {
      const existing = await this.prisma.facultad.findUnique({
        where: { codigo: createFacultadDto.codigo },
      });

      if (existing) {
        throw new ConflictException('Ya existe una facultad con ese código');
      }
    }

    const facultad = await this.prisma.facultad.create({
      data: createFacultadDto,
    });

    this.logger.log(`Facultad creada con ID: ${facultad.id}`);
    return facultad;
  }

  async findAll(query: QueryFacultadDto) {
    const { page = 1, limit = 10, sortBy = 'nombreFacultad', sortOrder = 'asc', search, codigo, tipo } = query;

    const skip = calculateSkip(page, limit);
    const where: Prisma.FacultadWhereInput = {};

    if (search) {
      where.OR = [
        { nombreFacultad: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (codigo) {
      where.codigo = { contains: codigo, mode: 'insensitive' };
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const [data, total] = await Promise.all([
      this.prisma.facultad.findMany({
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
      this.prisma.facultad.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const facultad = await this.prisma.facultad.findUnique({
      where: { id },
      include: {
        legajos: {
          include: {
            persona: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { legajos: true },
        },
      },
    });

    if (!facultad) {
      throw new NotFoundException(`Facultad con ID ${id} no encontrada`);
    }

    return facultad;
  }

  async update(id: string, updateFacultadDto: UpdateFacultadDto) {
    this.logger.log(`Actualizando facultad: ${id}`);

    await this.findOne(id);

    // Si se actualiza el código, verificar que no exista otra facultad con ese código
    if (updateFacultadDto.codigo) {
      const existing = await this.prisma.facultad.findUnique({
        where: { codigo: updateFacultadDto.codigo },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra facultad con ese código');
      }
    }

    const facultad = await this.prisma.facultad.update({
      where: { id },
      data: updateFacultadDto,
    });

    this.logger.log(`Facultad actualizada: ${id}`);
    return facultad;
  }

  async remove(id: string) {
    this.logger.log(`Eliminando facultad: ${id}`);

    await this.findOne(id);

    // Verificar si tiene legajos asociados
    const legajosCount = await this.prisma.legajo.count({
      where: { facultadId: id },
    });

    if (legajosCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la facultad porque tiene ${legajosCount} legajo(s) asociado(s)`,
      );
    }

    const facultad = await this.prisma.facultad.delete({
      where: { id },
    });

    this.logger.log(`Facultad eliminada: ${id}`);
    return facultad;
  }

  async getStats() {
    const [total, porTipo] = await Promise.all([
      this.prisma.facultad.count(),
      this.prisma.facultad.groupBy({
        by: ['tipo'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      porTipo: porTipo.map((item) => ({
        tipo: item.tipo,
        cantidad: item._count._all,
      })),
    };
  }
}
