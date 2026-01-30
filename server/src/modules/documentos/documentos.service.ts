import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { QueryDocumentoDto } from './dto/query-documento.dto';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    // Asegurar que existe el directorio de uploads
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(
    createDocumentoDto: CreateDocumentoDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log(`Creando documento: ${createDocumentoDto.nombreDocumento}`);

    // Verificar que el legajo existe
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: createDocumentoDto.legajoId },
    });

    if (!legajo) {
      // Si hay archivo, eliminarlo
      if (file) {
        await unlinkAsync(file.path).catch(() => {});
      }
      throw new NotFoundException('Legajo no encontrado');
    }

    const documentoData: any = {
      legajoId: createDocumentoDto.legajoId,
      tipoDocumento: createDocumentoDto.tipoDocumento,
      nombreArchivo: createDocumentoDto.nombreDocumento || 'Sin nombre',
      rutaArchivo: file ? file.path : '',
      extension: file ? file.originalname.split('.').pop() || '' : '',
      tamanioBytes: file ? BigInt(file.size) : BigInt(0),
      descripcion: createDocumentoDto.descripcion,
      tags: createDocumentoDto.tags ? createDocumentoDto.tags.split(',') : [],
      fechaDocumento: new Date(),
    };

    if (!file) {
      // Si no hay archivo, establecer valores por defecto
      documentoData.rutaArchivo = '';
      documentoData.extension = '';
    }

    const documento = await this.prisma.documento.create({
      data: documentoData,
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
      },
    });

    this.logger.log(`Documento creado con ID: ${documento.id}`);
    return documento;
  }

  async findAll(query: QueryDocumentoDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'creadoEn',
      sortOrder = 'desc',
      search,
      legajoId,
      tipoDocumento,
      tags,
    } = query;

    const skip = calculateSkip(page, limit);
    const where: Prisma.DocumentoWhereInput = {};

    if (search) {
      where.OR = [
        { nombreArchivo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (legajoId) {
      where.legajoId = legajoId;
    }

    if (tipoDocumento) {
      where.tipoDocumento = tipoDocumento;
    }

    if (tags) {
      where.tags = { has: tags };
    }

    const [data, total] = await Promise.all([
      this.prisma.documento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy === 'creadoEn' ? 'createdAt' : sortBy]: sortOrder },
        include: {
          legajo: {
            include: {
              persona: true,
            },
          },
        },
      }),
      this.prisma.documento.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
      include: {
        legajo: {
          include: {
            persona: true,
            facultad: true,
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return documento;
  }

  async findByLegajo(legajoId: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: legajoId },
    });

    if (!legajo) {
      throw new NotFoundException('Legajo no encontrado');
    }

    const documentos = await this.prisma.documento.findMany({
      where: { legajoId },
      orderBy: { createdAt: 'desc' },
    });

    return documentos;
  }

  async update(id: string, updateDocumentoDto: UpdateDocumentoDto) {
    this.logger.log(`Actualizando documento: ${id}`);

    await this.findOne(id);

    const documento = await this.prisma.documento.update({
      where: { id },
      data: {
        descripcion: updateDocumentoDto.descripcion,
        tags: updateDocumentoDto.tags ? updateDocumentoDto.tags.split(',') : undefined,
      },
      include: {
        legajo: {
          include: {
            persona: true,
          },
        },
      },
    });

    this.logger.log(`Documento actualizado: ${id}`);
    return documento;
  }

  async remove(id: string) {
    this.logger.log(`Eliminando documento: ${id}`);

    const documento = await this.findOne(id);

    // Eliminar archivo físico si existe
    if (documento.rutaArchivo && fs.existsSync(documento.rutaArchivo)) {
      try {
        await unlinkAsync(documento.rutaArchivo);
        this.logger.log(`Archivo eliminado: ${documento.rutaArchivo}`);
      } catch (error) {
        this.logger.error(`Error al eliminar archivo: ${error.message}`);
      }
    }

    await this.prisma.documento.delete({ where: { id } });

    this.logger.log(`Documento eliminado: ${id}`);
    return { message: 'Documento eliminado correctamente' };
  }

  async downloadFile(id: string): Promise<{ path: string; documento: any }> {
    const documento = await this.findOne(id);

    if (!documento.rutaArchivo) {
      throw new NotFoundException('Este documento no tiene archivo adjunto');
    }

    if (!fs.existsSync(documento.rutaArchivo)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    return {
      path: documento.rutaArchivo,
      documento,
    };
  }

  async getStats() {
    const [total, porTipo] = await Promise.all([
      this.prisma.documento.count(),
      this.prisma.documento.groupBy({
        by: ['tipoDocumento'],
        _count: { id: true },
      }),
    ]);

    const totalSize = await this.prisma.documento.aggregate({
      _sum: {
        tamanioBytes: true,
      },
    });

    const tamanioBigInt = totalSize._sum.tamanioBytes || BigInt(0);
    const tamanioBytes = Number(tamanioBigInt);

    return {
      total,
      porTipo: porTipo.map((item) => ({
        tipo: item.tipoDocumento,
        cantidad: item._count.id,
      })),
      tamanoTotalBytes: tamanioBytes,
      tamanoTotalMB: Math.round(tamanioBytes / 1024 / 1024),
    };
  }
}
