import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLineaPresupuestariaDto } from './dto/create-linea-presupuestaria.dto';
import { UpdateLineaPresupuestariaDto } from './dto/update-linea-presupuestaria.dto';

@Injectable()
export class LineasPresupuestariasService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLineaPresupuestariaDto) {
    // Verificar que el código no esté duplicado
    const existe = await this.prisma.lineaPresupuestaria.findUnique({
      where: { codigoLinea: createDto.codigoLinea },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe una línea con el código ${createDto.codigoLinea}`,
      );
    }

    return this.prisma.lineaPresupuestaria.create({
      data: {
        codigoLinea: createDto.codigoLinea,
        descripcion: createDto.descripcion,
        vigente: createDto.vigente ?? true,
      },
    });
  }

  async findAll(vigente?: boolean) {
    const where = vigente !== undefined ? { vigente } : {};

    return this.prisma.lineaPresupuestaria.findMany({
      where,
      orderBy: { codigoLinea: 'asc' },
    });
  }

  async findOne(id: string) {
    const linea = await this.prisma.lineaPresupuestaria.findUnique({
      where: { id },
    });

    if (!linea) {
      throw new NotFoundException(`Línea con ID ${id} no encontrada`);
    }

    return linea;
  }

  async update(id: string, updateDto: UpdateLineaPresupuestariaDto) {
    await this.findOne(id);

    // Si se actualiza el código, verificar que no esté duplicado
    if (updateDto.codigoLinea) {
      const existe = await this.prisma.lineaPresupuestaria.findFirst({
        where: {
          codigoLinea: updateDto.codigoLinea,
          NOT: { id },
        },
      });

      if (existe) {
        throw new ConflictException(
          `Ya existe otra línea con el código ${updateDto.codigoLinea}`,
        );
      }
    }

    return this.prisma.lineaPresupuestaria.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const linea = await this.prisma.lineaPresupuestaria.findUnique({
      where: { id },
    });

    if (!linea) {
      throw new NotFoundException(`Línea con ID ${id} no encontrada`);
    }

    // Ya no hay asignaciones en el modelo simplificado
    return this.prisma.lineaPresupuestaria.delete({ where: { id } });
  }

  async toggleVigente(id: string) {
    const linea = await this.findOne(id);

    return this.prisma.lineaPresupuestaria.update({
      where: { id },
      data: { vigente: !linea.vigente },
    });
  }
}
