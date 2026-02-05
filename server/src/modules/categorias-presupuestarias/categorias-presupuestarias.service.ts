import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoriaPresupuestariaDto } from './dto/create-categoria-presupuestaria.dto';
import { UpdateCategoriaPresupuestariaDto } from './dto/update-categoria-presupuestaria.dto';

@Injectable()
export class CategoriasPresupuestariasService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCategoriaPresupuestariaDto) {
    // Verificar que el código no esté duplicado
    const existe = await this.prisma.categoriaPresupuestaria.findUnique({
      where: { codigoCategoria: createDto.codigoCategoria },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe una categoría con el código ${createDto.codigoCategoria}`,
      );
    }

    // Validar que el rango sea coherente
    if (createDto.rangoSalarialMax < createDto.rangoSalarialMin) {
      throw new ConflictException(
        'El rango salarial máximo debe ser mayor o igual al mínimo',
      );
    }


    return this.prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: createDto.codigoCategoria,
        descripcion: createDto.descripcion,
        tipo: createDto.tipo,
        escalaSalarial: createDto.escalaSalarial,
        rangoSalarialMin: createDto.rangoSalarialMin,
        rangoSalarialMax: createDto.rangoSalarialMax,
        vigente: createDto.vigente ?? true,
      },
    });
  }

  async findAll(vigente?: boolean) {
    const where = vigente !== undefined ? { vigente } : {};

    return this.prisma.categoriaPresupuestaria.findMany({
      where,
      orderBy: { codigoCategoria: 'asc' },
    });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoriaPresupuestaria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async update(id: string, updateDto: UpdateCategoriaPresupuestariaDto) {
    await this.findOne(id);

    // Si se actualiza el código, verificar que no esté duplicado
    if (updateDto.codigoCategoria) {
      const existe = await this.prisma.categoriaPresupuestaria.findFirst({
        where: {
          codigoCategoria: updateDto.codigoCategoria,
          NOT: { id },
        },
      });

      if (existe) {
        throw new ConflictException(
          `Ya existe otra categoría con el código ${updateDto.codigoCategoria}`,
        );
      }
    }

    // Validar rangos si se actualizan
    if (updateDto.rangoSalarialMin || updateDto.rangoSalarialMax) {
      const categoria = await this.prisma.categoriaPresupuestaria.findUnique({
        where: { id },
      });

      const min = updateDto.rangoSalarialMin ?? categoria!.rangoSalarialMin ?? 0;
      const max = updateDto.rangoSalarialMax ?? categoria!.rangoSalarialMax ?? 0;

      if (max < min) {
        throw new ConflictException(
          'El rango salarial máximo debe ser mayor o igual al mínimo',
        );
      }
    }

    return this.prisma.categoriaPresupuestaria.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const categoria = await this.prisma.categoriaPresupuestaria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Ya no hay asignaciones en el modelo simplificado
    return this.prisma.categoriaPresupuestaria.delete({ where: { id } });
  }

  async toggleVigente(id: string) {
    const categoria = await this.findOne(id);

    return this.prisma.categoriaPresupuestaria.update({
      where: { id },
      data: { vigente: !categoria.vigente },
    });
  }
}
