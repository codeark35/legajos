import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto, UploadDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { QueryDocumentoDto } from './dto/query-documento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';

// Configuración de Multer para upload de archivos
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `documento-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, callback) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        'Tipo de archivo no permitido. Solo: PDF, JPG, PNG, DOC, DOCX',
      ),
      false,
    );
  }
};

@ApiTags('Documentos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECURSOS_HUMANOS)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: 'Subir documento con archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos del documento y archivo',
    type: UploadDocumentoDto,
  })
  @ApiResponse({ status: 201, description: 'Documento subido correctamente' })
  @ApiResponse({ status: 400, description: 'Archivo no válido' })
  @ApiResponse({ status: 404, description: 'Legajo no encontrado' })
  async uploadWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentoDto: CreateDocumentoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo');
    }

    return this.documentosService.create(createDocumentoDto, file);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.RECURSOS_HUMANOS)
  @ApiOperation({ summary: 'Crear documento sin archivo (solo metadata)' })
  @ApiResponse({ status: 201, description: 'Documento creado correctamente' })
  @ApiResponse({ status: 404, description: 'Legajo no encontrado' })
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentosService.create(createDocumentoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  findAll(@Query() query: QueryDocumentoDto) {
    return this.documentosService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de documentos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de documentos' })
  getStats() {
    return this.documentosService.getStats();
  }

  @Get('legajo/:legajoId')
  @ApiOperation({ summary: 'Obtener documentos de un legajo' })
  @ApiResponse({ status: 200, description: 'Lista de documentos del legajo' })
  @ApiResponse({ status: 404, description: 'Legajo no encontrado' })
  findByLegajo(@Param('legajoId') legajoId: string) {
    return this.documentosService.findByLegajo(legajoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de documento' })
  @ApiResponse({ status: 200, description: 'Detalle del documento' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar archivo del documento' })
  @ApiResponse({ status: 200, description: 'Archivo descargado' })
  @ApiResponse({ status: 404, description: 'Documento o archivo no encontrado' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { path, documento } = await this.documentosService.downloadFile(id);

    res.setHeader('Content-Type', documento.tipoMime || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${documento.nombreArchivo}"`,
    );

    res.sendFile(path, { root: './' });
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECURSOS_HUMANOS)
  @ApiOperation({ summary: 'Actualizar metadata de documento' })
  @ApiResponse({ status: 200, description: 'Documento actualizado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    return this.documentosService.update(id, updateDocumentoDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECURSOS_HUMANOS)
  @ApiOperation({ summary: 'Eliminar documento y su archivo' })
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id') id: string) {
    return this.documentosService.remove(id);
  }
}
