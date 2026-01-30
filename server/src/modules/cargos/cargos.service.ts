import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { QueryCargoDto } from './dto/query-cargo.dto';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';

@Injectable()
export class CargosService {
  private readonly logger = new Logger(CargosService.name);

  constructor(private prisma: PrismaService) {}

  async create(createCargoDto: CreateCargoDto) {
    this.logger.log(`Creando cargo: ${createCargoDto.nombreCargo}`);

    // Verificar si ya existe un cargo con ese nombre
    const existing = await this.prisma.cargo.findFirst({
      where: {
        nombreCargo: {
          equals: createCargoDto.nombreCargo,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un cargo con ese nombre');
    }

    const cargo = await this.prisma.cargo.create({
      data: createCargoDto,
    });

    this.logger.log(`Cargo creado con ID: ${cargo.id}`);
    return cargo;
  }

  async findAll(query: QueryCargoDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'nombreCargo',
      sortOrder = 'asc',
      search,
      nivelJerarquico,
      departamentoArea,
    } = query;

    const skip = calculateSkip(page, limit);
    const where: Prisma.CargoWhereInput = {};

    if (search) {
      where.OR = [
        { nombreCargo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (nivelJerarquico) {
      where.nivelJerarquico = nivelJerarquico;
    }

    if (departamentoArea) {
      where.departamentoArea = { contains: departamentoArea, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.cargo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { nombramientos: true },
          },
        },
      }),
      this.prisma.cargo.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const cargo = await this.prisma.cargo.findUnique({
      where: { id },
      include: {
        nombramientos: {
          include: {
            legajo: {
              include: {
                persona: true,
              },
            },
          },
          take: 10,
          orderBy: { fechaInicio: 'desc' },
        },
        _count: {
          select: { nombramientos: true },
        },
      },
    });

    if (!cargo) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }

    return cargo;
  }

  async update(id: string, updateCargoDto: UpdateCargoDto) {
    this.logger.log(`Actualizando cargo: ${id}`);

    await this.findOne(id);

    // Si se actualiza el nombre, verificar que no exista otro cargo con ese nombre
    if (updateCargoDto.nombreCargo) {
      const existing = await this.prisma.cargo.findFirst({
        where: {
          nombreCargo: {
            equals: updateCargoDto.nombreCargo,
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe otro cargo con ese nombre');
      }
    }

    const cargo = await this.prisma.cargo.update({
      where: { id },
      data: updateCargoDto,
    });

    this.logger.log(`Cargo actualizado: ${id}`);
    return cargo;
  }

  async remove(id: string) {
    this.logger.log(`Eliminando cargo: ${id}`);

    await this.findOne(id);

    // Verificar si tiene nombramientos asociados
    const nombramientosCount = await this.prisma.nombramiento.count({
      where: { cargoId: id },
    });

    if (nombramientosCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el cargo porque tiene ${nombramientosCount} nombramiento(s) asociado(s)`,
      );
    }

    const cargo = await this.prisma.cargo.delete({
      where: { id },
    });

    this.logger.log(`Cargo eliminado: ${id}`);
    return cargo;
  }

  async getStats() {
    const [total, porNivel] = await Promise.all([
      this.prisma.cargo.count(),
      this.prisma.cargo.groupBy({
        by: ['nivelJerarquico'],
        _count: { _all: true },
        where: {
          nivelJerarquico: { not: null },
        },
      }),
    ]);

    return {
      total,
      porNivel: porNivel.map((item) => ({
        nivel: item.nivelJerarquico,
        cantidad: item._count._all,
      })),
    };
  }
}
