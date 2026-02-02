import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FacultadesService } from './facultades.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('facultades')
@ApiTags('Facultades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FacultadesController {
  constructor(private readonly facultadesService: FacultadesService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nueva facultad' })
  @ApiResponse({ status: 201, description: 'Facultad creada exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe una facultad con ese nombre' })
  create(@Body() createFacultadDto: CreateFacultadDto) {
    return this.facultadesService.create(createFacultadDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar todas las facultades' })
  @ApiResponse({ status: 200, description: 'Lista de facultades' })
  findAll() {
    return this.facultadesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener facultad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la facultad' })
  @ApiResponse({ status: 200, description: 'Facultad encontrada' })
  @ApiResponse({ status: 404, description: 'Facultad no encontrada' })
  findOne(@Param('id') id: string) {
    return this.facultadesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar facultad' })
  @ApiParam({ name: 'id', description: 'ID de la facultad' })
  @ApiResponse({ status: 200, description: 'Facultad actualizada' })
  @ApiResponse({ status: 404, description: 'Facultad no encontrada' })
  update(@Param('id') id: string, @Body() updateFacultadDto: UpdateFacultadDto) {
    return this.facultadesService.update(id, updateFacultadDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar facultad' })
  @ApiParam({ name: 'id', description: 'ID de la facultad' })
  @ApiResponse({ status: 204, description: 'Facultad eliminada' })
  @ApiResponse({ status: 404, description: 'Facultad no encontrada' })
  remove(@Param('id') id: string) {
    return this.facultadesService.remove(id);
  }
}
