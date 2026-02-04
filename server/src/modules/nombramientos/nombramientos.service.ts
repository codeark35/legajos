import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNombramientoDto } from './dto/create-nombramiento.dto';
import { UpdateNombramientoDto } from './dto/update-nombramiento.dto';
import { QueryNombramientosDto } from './dto/query-nombramientos.dto';
import { AgregarMesDto } from './dto/agregar-mes.dto';
import { HistoricoMensual, MesData } from './dto/mes-data.interface';

@Injectable()
export class NombramientosService {
  constructor(private prisma: PrismaService) {}

  async create(createNombramientoDto: CreateNombramientoDto) {
    // Verificar que el legajo existe
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: createNombramientoDto.legajoId },
    });
    if (!legajo) {
      throw new BadRequestException('El legajo especificado no existe');
    }

    // Verificar que el cargo existe
    const cargo = await this.prisma.cargo.findUnique({
      where: { id: createNombramientoDto.cargoId },
    });
    if (!cargo) {
      throw new BadRequestException('El cargo especificado no existe');
    }

    // Validar fechas
    const fechaInicio = new Date(createNombramientoDto.fechaInicio);
    if (createNombramientoDto.fechaFin) {
      const fechaFin = new Date(createNombramientoDto.fechaFin);
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio',
        );
      }
    }

    const data: any = {
      legajo: { connect: { id: createNombramientoDto.legajoId } },
      cargo: { connect: { id: createNombramientoDto.cargoId } },
      tipoNombramiento: createNombramientoDto.tipoNombramiento || cargo.nombreCargo,
      fechaInicio: new Date(createNombramientoDto.fechaInicio),
      vigente: createNombramientoDto.vigente ?? true,
    };

    if (createNombramientoDto.categoria) {
      data.categoria = createNombramientoDto.categoria;
    }

    if (createNombramientoDto.salarioBase) {
      data.salarioBase = createNombramientoDto.salarioBase;
    }

    if (createNombramientoDto.fechaFin) {
      data.fechaFin = new Date(createNombramientoDto.fechaFin);
    }

    if (createNombramientoDto.observaciones) {
      data.observaciones = createNombramientoDto.observaciones;
    }

    return this.prisma.nombramiento.create({
      data,
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
            facultad: {
              select: {
                nombreFacultad: true,
              },
            },
          },
        },
        cargo: true,
      },
    });
  }

  async findAll(query: QueryNombramientosDto) {
    const { page = 1, limit = 10, search, legajoId, cargoId, vigente } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (legajoId) {
      where.legajoId = legajoId;
    }

    if (cargoId) {
      where.cargoId = cargoId;
    }

    if (vigente !== undefined) {
      where.vigente = vigente;
    }

    if (search) {
      where.observaciones = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.nombramiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaInicio: 'desc' },
        include: {
          legajo: {
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
          },
          cargo: true,
        },
      }),
      this.prisma.nombramiento.count({ where }),
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
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id },
      include: {
        legajo: {
          include: {
            persona: true,
            facultad: true,
          },
        },
        cargo: true,
      },
    });

    if (!nombramiento) {
      throw new NotFoundException(
        `Nombramiento con ID ${id} no encontrado`,
      );
    }

    return nombramiento;
  }

  async update(id: string, updateNombramientoDto: UpdateNombramientoDto) {
    // Verificar que existe
    await this.findOne(id);

    // Validar fechas si se proporcionan ambas
    if (updateNombramientoDto.fechaInicio && updateNombramientoDto.fechaFin) {
      const fechaInicio = new Date(updateNombramientoDto.fechaInicio);
      const fechaFin = new Date(updateNombramientoDto.fechaFin);
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio',
        );
      }
    }

    const data: any = {};

    if (updateNombramientoDto.legajoId) {
      const legajo = await this.prisma.legajo.findUnique({
        where: { id: updateNombramientoDto.legajoId },
      });
      if (!legajo) {
        throw new BadRequestException('El legajo especificado no existe');
      }
      data.legajo = { connect: { id: updateNombramientoDto.legajoId } };
    }

    if (updateNombramientoDto.cargoId) {
      const cargo = await this.prisma.cargo.findUnique({
        where: { id: updateNombramientoDto.cargoId },
      });
      if (!cargo) {
        throw new BadRequestException('El cargo especificado no existe');
      }
      data.cargo = { connect: { id: updateNombramientoDto.cargoId } };
    }

    if (updateNombramientoDto.fechaInicio) {
      data.fechaInicio = new Date(updateNombramientoDto.fechaInicio);
    }

    if (updateNombramientoDto.fechaFin) {
      data.fechaFin = new Date(updateNombramientoDto.fechaFin);
    }

    if (updateNombramientoDto.tipoNombramiento) {
      data.tipoNombramiento = updateNombramientoDto.tipoNombramiento;
    }

    if (updateNombramientoDto.categoria !== undefined) {
      data.categoria = updateNombramientoDto.categoria;
    }

    if (updateNombramientoDto.salarioBase !== undefined) {
      data.salarioBase = updateNombramientoDto.salarioBase;
    }

    if (updateNombramientoDto.vigente !== undefined) {
      data.vigente = updateNombramientoDto.vigente;
      // Si se marca como no vigente, actualizar estadoNombramiento a FINALIZADO
      if (updateNombramientoDto.vigente === false) {
        data.estadoNombramiento = 'FINALIZADO';
      }
    }

    if (updateNombramientoDto.observaciones !== undefined) {
      data.observaciones = updateNombramientoDto.observaciones;
    }

    return this.prisma.nombramiento.update({
      where: { id },
      data,
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
            facultad: {
              select: {
                nombreFacultad: true,
              },
            },
          },
        },
        cargo: true,
      },
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.nombramiento.delete({
      where: { id },
    });
  }

  /**
   * Listar todos los legajos con sus nombramientos (para accordion)
   */
  async findAllLegajosConNombramientos() {
    const legajos = await this.prisma.legajo.findMany({
      where: {
        estadoLegajo: 'ACTIVO',
      },
      orderBy: [
        { persona: { apellidos: 'asc' } },
        { persona: { nombres: 'asc' } },
      ],
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
        nombramientos: {
          where: {
            vigente: true,
          },
          orderBy: { fechaInicio: 'desc' },
          include: {
            cargo: {
              select: {
                id: true,
                nombreCargo: true,
              },
            },
          },
        },
      },
    });

    return legajos.map((legajo) => ({
      id: legajo.id,
      numeroLegajo: legajo.numeroLegajo,
      persona: {
        id: legajo.persona.id,
        nombreCompleto: `${legajo.persona.apellidos} ${legajo.persona.nombres}`,
        nombres: legajo.persona.nombres,
        apellidos: legajo.persona.apellidos,
        numeroCedula: legajo.persona.numeroCedula,
      },
      facultad: legajo.facultad,
      nombramientos: legajo.nombramientos.map((n) => ({
        id: n.id,
        tipoNombramiento: n.tipoNombramiento,
        cargo: n.cargo,
        fechaInicio: n.fechaInicio,
        fechaFin: n.fechaFin,
        vigente: n.vigente,
        estadoNombramiento: n.estadoNombramiento,
      })),
    }));
  }

  /**
   * Obtener histórico mensual completo de un nombramiento
   */
  async getHistoricoMensual(nombramientoId: string) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: nombramientoId },
      include: {
        legajo: {
          include: {
            persona: true,
            facultad: true,
          },
        },
        cargo: true,
      },
    });

    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    const historico = (nombramiento.historicoMensual as any) || {};

    return {
      nombramiento: {
        id: nombramiento.id,
        tipoNombramiento: nombramiento.tipoNombramiento,
        categoria: nombramiento.categoria,
        salarioBase: nombramiento.salarioBase,
        cargo: nombramiento.cargo,
        fechaInicio: nombramiento.fechaInicio,
        fechaFin: nombramiento.fechaFin,
        vigente: nombramiento.vigente,
        estadoNombramiento: nombramiento.estadoNombramiento,
        legajo: nombramiento.legajo,
      },
      historico,
    };
  }

  /**
   * Agregar un nuevo mes al histórico
   */
  async agregarMes(nombramientoId: string, dto: AgregarMesDto) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: nombramientoId },
    });

    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    // Obtener datos de línea y categoría
    const [linea, categoria] = await Promise.all([
      this.prisma.lineaPresupuestaria.findUnique({
        where: { id: dto.lineaPresupuestariaId },
      }),
      this.prisma.categoriaPresupuestaria.findUnique({
        where: { id: dto.categoriaPresupuestariaId },
      }),
    ]);

    if (!linea) {
      throw new BadRequestException('Línea presupuestaria no encontrada');
    }
    if (!categoria) {
      throw new BadRequestException('Categoría presupuestaria no encontrada');
    }

    const historico: HistoricoMensual = (nombramiento.historicoMensual as any) || {};
    const anioStr = dto.anio.toString();
    const mesStr = dto.mes.toString().padStart(2, '0');

    // Verificar que el mes no exista ya
    if (historico[anioStr]?.[mesStr]) {
      throw new ConflictException(`El mes ${mesStr}/${anioStr} ya está registrado`);
    }

    // Inicializar año si no existe
    if (!historico[anioStr]) {
      historico[anioStr] = {};
    }

    // Agregar mes
    const mesData: MesData = {
      presupuestado: dto.presupuestado,
      devengado: dto.devengado,
      aporteJubilatorio: dto.aporteJubilatorio || 0,
      aportesPersonales: dto.aportesPersonales || 0,
      lineaPresupuestariaId: dto.lineaPresupuestariaId,
      codigoLinea: linea.codigoLinea,
      descripcionLinea: linea.descripcion || '',
      categoriaPresupuestariaId: dto.categoriaPresupuestariaId,
      codigoCategoria: categoria.codigoCategoria,
      descripcionCategoria: categoria.descripcion,
      objetoGasto: dto.objetoGasto || '',
      observaciones: dto.observaciones || '',
      fechaRegistro: new Date().toISOString(),
    };

    historico[anioStr][mesStr] = mesData;

    // Actualizar en base de datos
    return this.prisma.nombramiento.update({
      where: { id: nombramientoId },
      data: { historicoMensual: historico as any },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
        cargo: true,
      },
    });
  }

  /**
   * Actualizar un mes existente
   */
  async actualizarMes(
    nombramientoId: string,
    anio: number,
    mes: number,
    dto: AgregarMesDto,
  ) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: nombramientoId },
    });

    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    const historico: HistoricoMensual = (nombramiento.historicoMensual as any) || {};
    const anioStr = anio.toString();
    const mesStr = mes.toString().padStart(2, '0');

    // Verificar que el mes existe
    if (!historico[anioStr]?.[mesStr]) {
      throw new NotFoundException(`El mes ${mesStr}/${anioStr} no está registrado`);
    }

    // Obtener datos de línea y categoría
    const [linea, categoria] = await Promise.all([
      this.prisma.lineaPresupuestaria.findUnique({
        where: { id: dto.lineaPresupuestariaId },
      }),
      this.prisma.categoriaPresupuestaria.findUnique({
        where: { id: dto.categoriaPresupuestariaId },
      }),
    ]);

    if (!linea || !categoria) {
      throw new BadRequestException('Línea o categoría presupuestaria no encontrada');
    }

    // Actualizar mes manteniendo fechaRegistro original
    const mesExistente = historico[anioStr][mesStr];
    historico[anioStr][mesStr] = {
      ...mesExistente,
      presupuestado: dto.presupuestado,
      devengado: dto.devengado,
      aporteJubilatorio: dto.aporteJubilatorio || 0,
      aportesPersonales: dto.aportesPersonales || 0,
      lineaPresupuestariaId: dto.lineaPresupuestariaId,
      codigoLinea: linea.codigoLinea,
      descripcionLinea: linea.descripcion || '',
      categoriaPresupuestariaId: dto.categoriaPresupuestariaId,
      codigoCategoria: categoria.codigoCategoria,
      descripcionCategoria: categoria.descripcion,
      objetoGasto: dto.objetoGasto || '',
      observaciones: dto.observaciones || '',
    };

    return this.prisma.nombramiento.update({
      where: { id: nombramientoId },
      data: { historicoMensual: historico as any },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
        cargo: true,
      },
    });
  }

  /**
   * Eliminar un mes del histórico
   */
  async eliminarMes(nombramientoId: string, anio: number, mes: number) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: nombramientoId },
    });

    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    const historico: HistoricoMensual = (nombramiento.historicoMensual as any) || {};
    const anioStr = anio.toString();
    const mesStr = mes.toString().padStart(2, '0');

    if (!historico[anioStr]?.[mesStr]) {
      throw new NotFoundException(`El mes ${mesStr}/${anioStr} no está registrado`);
    }

    delete historico[anioStr][mesStr];

    // Si el año quedó vacío, eliminarlo también
    if (Object.keys(historico[anioStr]).length === 0) {
      delete historico[anioStr];
    }

    return this.prisma.nombramiento.update({
      where: { id: nombramientoId },
      data: { historicoMensual: historico as any },
    });
  }

  /**
   * Obtener resumen/estadísticas del nombramiento
   */
  async getResumenNombramiento(nombramientoId: string) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id: nombramientoId },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
        cargo: true,
      },
    });

    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    const historico: HistoricoMensual = (nombramiento.historicoMensual as any) || {};

    let totalPresupuestado = 0;
    let totalDevengado = 0;
    let totalAporteJubilatorio = 0;
    let totalAportesPersonales = 0;
    let cantidadMeses = 0;

    Object.values(historico).forEach((anio: any) => {
      Object.values(anio).forEach((mes: any) => {
        totalPresupuestado += mes.presupuestado || 0;
        totalDevengado += mes.devengado || 0;
        totalAporteJubilatorio += mes.aporteJubilatorio || 0;
        totalAportesPersonales += mes.aportesPersonales || 0;
        cantidadMeses++;
      });
    });

    return {
      nombramiento: {
        id: nombramiento.id,
        tipoNombramiento: nombramiento.tipoNombramiento,
        cargo: nombramiento.cargo,
        fechaInicio: nombramiento.fechaInicio,
        fechaFin: nombramiento.fechaFin,
        legajo: nombramiento.legajo,
      },
      resumen: {
        cantidadMeses,
        totalPresupuestado,
        totalDevengado,
        totalAporteJubilatorio,
        totalAportesPersonales,
        promedioPresupuestado: cantidadMeses > 0 ? totalPresupuestado / cantidadMeses : 0,
        promedioDevengado: cantidadMeses > 0 ? totalDevengado / cantidadMeses : 0,
      },
    };
  }

  /**
   * Obtener histórico mensual completo de un nombramiento (alias)
   */
  async obtenerHistoricoMensual(id: string, anio?: number, mes?: number) {
    const nombramiento = await this.prisma.nombramiento.findUnique({
      where: { id },
    });

    if (!nombramiento) {
      throw new NotFoundException('Nombramiento no encontrado');
    }

    const historico = (nombramiento.historicoMensual as any) || {};

    // Si se solicita un mes específico
    if (anio && mes) {
      const mesKey = `${anio}-${mes.toString().padStart(2, '0')}`;
      return historico[mesKey] || null;
    }

    // Retornar todo el histórico
    return historico;
  }

  /**
   * Actualizar histórico mensual de un nombramiento (alias para compatibilidad)
   */
  async updateHistoricoMensual(id: string, updateDto: any) {
    return this.agregarMes(id, updateDto);
  }

  async obtenerHistoricoAsignaciones(nombramientoId: string) {
    // Este método ya no aplica con el nuevo modelo
    // Retornar el histórico mensual directamente
    return this.obtenerHistoricoMensual(nombramientoId);
  }
}

