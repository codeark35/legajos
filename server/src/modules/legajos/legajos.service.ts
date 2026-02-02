import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLegajoDto } from './dto/create-legajo.dto';
import { UpdateLegajoDto } from './dto/update-legajo.dto';
import { QueryLegajosDto } from './dto/query-legajos.dto';

@Injectable()
export class LegajosService {
  constructor(private prisma: PrismaService) {}

  async create(createLegajoDto: CreateLegajoDto) {
    // Verificar que la persona existe
    const persona = await this.prisma.persona.findUnique({
      where: { id: createLegajoDto.personaId },
    });
    if (!persona) {
      throw new BadRequestException('La persona especificada no existe');
    }

    // Verificar que la facultad existe
    const facultad = await this.prisma.facultad.findUnique({
      where: { id: createLegajoDto.facultadId },
    });
    if (!facultad) {
      throw new BadRequestException('La facultad especificada no existe');
    }

    // Verificar que el número de legajo sea único
    const existingLegajo = await this.prisma.legajo.findFirst({
      where: { numeroLegajo: createLegajoDto.numeroLegajo },
    });
    if (existingLegajo) {
      throw new ConflictException('El número de legajo ya está en uso');
    }

    // Verificar que la persona no tenga ya un legajo en esa facultad
    const existingLegajoPersona = await this.prisma.legajo.findFirst({
      where: {
        personaId: createLegajoDto.personaId,
        facultadId: createLegajoDto.facultadId,
      },
    });
    if (existingLegajoPersona) {
      throw new ConflictException(
        'La persona ya tiene un legajo en esta facultad',
      );
    }

    const data: any = {
      numeroLegajo: createLegajoDto.numeroLegajo,
      persona: { connect: { id: createLegajoDto.personaId } },
      facultad: { connect: { id: createLegajoDto.facultadId } },
    };

    if (createLegajoDto.fechaApertura) {
      data.fechaApertura = new Date(createLegajoDto.fechaApertura);
    }

    return this.prisma.legajo.create({
      data,
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
    });
  }

  async findAll(query: QueryLegajosDto) {
    const { page = 1, limit = 10, search, facultadId, personaId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { numeroLegajo: { contains: search, mode: 'insensitive' } },
        {
          persona: {
            nombres: { contains: search, mode: 'insensitive' },
          },
        },
        {
          persona: {
            apellidos: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (facultadId) {
      where.facultadId = facultadId;
    }

    if (personaId) {
      where.personaId = personaId;
    }

    const [data, total] = await Promise.all([
      this.prisma.legajo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaApertura: 'desc' },
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
          _count: {
            select: { nombramientos: true },
          },
        },
      }),
      this.prisma.legajo.count({ where }),
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

  async findOne(id: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id },
      include: {
        persona: true,
        facultad: true,
        nombramientos: {
          include: {
            cargo: true,
            asignacionPresupuestaria: {
              include: {
                categoriaPresupuestaria: true,
                lineaPresupuestaria: true,
              },
            },
          },
          orderBy: { fechaInicio: 'desc' },
        },
      },
    });

    if (!legajo) {
      throw new NotFoundException(`Legajo con ID ${id} no encontrado`);
    }

    return legajo;
  }

  async update(id: string, updateLegajoDto: UpdateLegajoDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando el número de legajo, verificar que sea único
    if (updateLegajoDto.numeroLegajo) {
      const existingLegajo = await this.prisma.legajo.findFirst({
        where: {
          numeroLegajo: updateLegajoDto.numeroLegajo,
          NOT: { id },
        },
      });
      if (existingLegajo) {
        throw new ConflictException('El número de legajo ya está en uso');
      }
    }

    const data: any = {};

    if (updateLegajoDto.numeroLegajo) {
      data.numeroLegajo = updateLegajoDto.numeroLegajo;
    }

    if (updateLegajoDto.personaId) {
      const persona = await this.prisma.persona.findUnique({
        where: { id: updateLegajoDto.personaId },
      });
      if (!persona) {
        throw new BadRequestException('La persona especificada no existe');
      }
      data.persona = { connect: { id: updateLegajoDto.personaId } };
    }

    if (updateLegajoDto.facultadId) {
      const facultad = await this.prisma.facultad.findUnique({
        where: { id: updateLegajoDto.facultadId },
      });
      if (!facultad) {
        throw new BadRequestException('La facultad especificada no existe');
      }
      data.facultad = { connect: { id: updateLegajoDto.facultadId } };
    }

    if (updateLegajoDto.fechaApertura) {
      data.fechaApertura = new Date(updateLegajoDto.fechaApertura);
    }

    return this.prisma.legajo.update({
      where: { id },
      data,
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
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.legajo.delete({
      where: { id },
    });
  }
}
