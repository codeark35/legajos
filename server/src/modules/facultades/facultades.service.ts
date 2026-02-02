import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';

@Injectable()
export class FacultadesService {
  constructor(private prisma: PrismaService) {}

  async create(createFacultadDto: CreateFacultadDto) {
    // Verificar si ya existe una facultad con el mismo nombre
    const existingFacultad = await this.prisma.facultad.findFirst({
      where: { nombreFacultad: createFacultadDto.nombreFacultad },
    });

    if (existingFacultad) {
      throw new ConflictException('Ya existe una facultad con ese nombre');
    }

    return this.prisma.facultad.create({
      data: createFacultadDto,
    });
  }

  async findAll() {
    return this.prisma.facultad.findMany({
      orderBy: { nombreFacultad: 'asc' },
      include: {
        _count: {
          select: {
            legajos: true,
            dependencias: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const facultad = await this.prisma.facultad.findUnique({
      where: { id },
      include: {
        legajos: {
          include: {
            persona: {
              select: {
                nombres: true,
                apellidos: true,
                numeroCedula: true,
              },
            },
          },
          orderBy: { fechaApertura: 'desc' },
        },
        dependencias: {
          orderBy: { nombre: 'asc' },
        },
      },
    });

    if (!facultad) {
      throw new NotFoundException(`Facultad con ID ${id} no encontrada`);
    }

    return facultad;
  }

  async update(id: string, updateFacultadDto: UpdateFacultadDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otra facultad con ese nombre
    if (updateFacultadDto.nombreFacultad) {
      const existingFacultad = await this.prisma.facultad.findFirst({
        where: {
          nombreFacultad: updateFacultadDto.nombreFacultad,
          NOT: { id },
        },
      });

      if (existingFacultad) {
        throw new ConflictException('Ya existe una facultad con ese nombre');
      }
    }

    return this.prisma.facultad.update({
      where: { id },
      data: updateFacultadDto,
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.facultad.delete({
      where: { id },
    });
  }
}
