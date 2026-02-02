import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Injectable()
export class CargosService {
  constructor(private prisma: PrismaService) {}

  async create(createCargoDto: CreateCargoDto) {
    // Verificar si ya existe un cargo con el mismo nombre
    const existingCargo = await this.prisma.cargo.findFirst({
      where: { nombreCargo: createCargoDto.nombreCargo },
    });

    if (existingCargo) {
      throw new ConflictException('Ya existe un cargo con ese nombre');
    }

    return this.prisma.cargo.create({
      data: createCargoDto,
    });
  }

  async findAll() {
    return this.prisma.cargo.findMany({
      orderBy: { nombreCargo: 'asc' },
      include: {
        _count: {
          select: { nombramientos: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const cargo = await this.prisma.cargo.findUnique({
      where: { id },
      include: {
        nombramientos: {
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
          },
          orderBy: { fechaInicio: 'desc' },
        },
      },
    });

    if (!cargo) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }

    return cargo;
  }

  async update(id: string, updateCargoDto: UpdateCargoDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro cargo con ese nombre
    if (updateCargoDto.nombreCargo) {
      const existingCargo = await this.prisma.cargo.findFirst({
        where: {
          nombreCargo: updateCargoDto.nombreCargo,
          NOT: { id },
        },
      });

      if (existingCargo) {
        throw new ConflictException('Ya existe un cargo con ese nombre');
      }
    }

    return this.prisma.cargo.update({
      where: { id },
      data: updateCargoDto,
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.cargo.delete({
      where: { id },
    });
  }
}
