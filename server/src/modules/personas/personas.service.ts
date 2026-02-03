import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { QueryPersonasDto } from './dto/query-personas.dto';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear nueva persona
   */
  async create(createPersonaDto: CreatePersonaDto) {
    const { numeroCedula } = createPersonaDto;

    // Verificar si la cédula ya existe
    const existing = await this.prisma.persona.findUnique({
      where: { numeroCedula },
    });

    if (existing) {
      throw new ConflictException('La cédula ya está registrada');
    }

    // Crear persona
    const persona = await this.prisma.persona.create({
      data: {
        ...createPersonaDto,
        fechaNacimiento: createPersonaDto.fechaNacimiento
          ? new Date(createPersonaDto.fechaNacimiento)
          : null,
      },
    });

    return persona;
  }

  /**
   * Listar personas con paginación y búsqueda
   */
  async findAll(query: QueryPersonasDto) {
    const { page = 1, limit = 10, search, estado } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { numeroCedula: { contains: search } },
      ];
    }

    if (estado) {
      where.estado = estado;
    }

    // Ejecutar queries en paralelo
    const [personas, total] = await Promise.all([
      this.prisma.persona.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      }),
      this.prisma.persona.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: personas,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtener persona por ID
   */
  async findOne(id: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        legajos: {
          include: {
            facultad: true,
            nombramientos: {
              where: { vigente: true },
              include: {
                cargo: true,
              },
            },
          },
        },
      },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return persona;
  }

  /**
   * Actualizar persona
   */
  async update(id: string, updatePersonaDto: UpdatePersonaDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando la cédula, verificar que no exista
    if (updatePersonaDto.numeroCedula) {
      const existing = await this.prisma.persona.findUnique({
        where: { numeroCedula: updatePersonaDto.numeroCedula },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('La cédula ya está registrada');
      }
    }

    // Actualizar
    const persona = await this.prisma.persona.update({
      where: { id },
      data: {
        ...updatePersonaDto,
        fechaNacimiento: updatePersonaDto.fechaNacimiento
          ? new Date(updatePersonaDto.fechaNacimiento)
          : undefined,
      },
    });

    return persona;
  }

  /**
   * Eliminar persona
   */
  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.prisma.persona.delete({
      where: { id },
    });

    return { message: 'Persona eliminada exitosamente' };
  }
}
