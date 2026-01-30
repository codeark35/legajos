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
import { QueryFacultadDto } from './dto/query-facultad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Facultades')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facultades')
export class FacultadesController {
  constructor(private readonly facultadesService: FacultadesService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nueva facultad o dependencia' })
  @ApiResponse({
    status: 201,
    description: 'Facultad creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una facultad con ese código',
  })
  create(@Body() createFacultadDto: CreateFacultadDto) {
    return this.facultadesService.create(createFacultadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las facultades con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de facultades',
  })
  findAll(@Query() query: QueryFacultadDto) {
    return this.facultadesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de facultades' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de facultades por tipo',
  })
  getStats() {
    return this.facultadesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una facultad' })
  @ApiParam({
    name: 'id',
    description: 'ID de la facultad',
  })
  @ApiResponse({
    status: 200,
    description: 'Facultad encontrada con sus legajos',
  })
  @ApiResponse({
    status: 404,
    description: 'Facultad no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.facultadesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar datos de una facultad' })
  @ApiParam({
    name: 'id',
    description: 'ID de la facultad',
  })
  @ApiResponse({
    status: 200,
    description: 'Facultad actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Facultad no encontrada',
  })
  update(@Param('id') id: string, @Body() updateFacultadDto: UpdateFacultadDto) {
    return this.facultadesService.update(id, updateFacultadDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una facultad' })
  @ApiParam({
    name: 'id',
    description: 'ID de la facultad',
  })
  @ApiResponse({
    status: 200,
    description: 'Facultad eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Facultad no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar porque tiene legajos asociados',
  })
  remove(@Param('id') id: string) {
    return this.facultadesService.remove(id);
  }
}
