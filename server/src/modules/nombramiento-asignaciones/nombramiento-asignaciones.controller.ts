import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NombramientoAsignacionesService } from './nombramiento-asignaciones.service';
import { CreateNombramientoAsignacionDto } from './dto/create-nombramiento-asignacion.dto';
import { UpdateHistoricoMensualDto } from './dto/update-historico-mensual.dto';
import { FinalizarAsignacionDto } from './dto/finalizar-asignacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Nombramiento-Asignaciones')
@Controller('nombramiento-asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NombramientoAsignacionesController {
  constructor(
    private readonly nombramientoAsignacionesService: NombramientoAsignacionesService,
  ) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear relación nombramiento-asignación' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createDto: CreateNombramientoAsignacionDto) {
    return this.nombramientoAsignacionesService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar todas las asignaciones nombramiento-asignación' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  findAll() {
    return this.nombramientoAsignacionesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.nombramientoAsignacionesService.findOne(id);
  }

  @Get('nombramiento/:nombramientoId')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener asignaciones de un nombramiento' })
  @ApiParam({ name: 'nombramientoId', description: 'ID del nombramiento' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones del nombramiento' })
  findByNombramiento(@Param('nombramientoId') nombramientoId: string) {
    return this.nombramientoAsignacionesService.findByNombramiento(nombramientoId);
  }

  @Get('asignacion/:asignacionId')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener nombramientos con una asignación específica' })
  @ApiParam({ name: 'asignacionId', description: 'ID de la asignación presupuestaria' })
  @ApiResponse({ status: 200, description: 'Lista de nombramientos con esa asignación' })
  findByAsignacion(@Param('asignacionId') asignacionId: string) {
    return this.nombramientoAsignacionesService.findByAsignacion(asignacionId);
  }

  @Get('asignacion/:asignacionId/mes/:anio/:mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener personas con asignación en un mes específico' })
  @ApiParam({ name: 'asignacionId', description: 'ID de la asignación presupuestaria' })
  @ApiParam({ name: 'anio', description: 'Año' })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)' })
  @ApiResponse({ status: 200, description: 'Lista de personas con esa asignación ese mes' })
  findByAsignacionAndMonth(
    @Param('asignacionId') asignacionId: string,
    @Param('anio') anio: string,
    @Param('mes') mes: string,
  ) {
    return this.nombramientoAsignacionesService.findByAsignacionAndMonth(
      asignacionId,
      parseInt(anio),
      parseInt(mes),
    );
  }

  @Patch(':id/historico')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar histórico mensual' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Histórico actualizado' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  updateHistoricoMensual(
    @Param('id') id: string,
    @Body() updateDto: UpdateHistoricoMensualDto,
  ) {
    return this.nombramientoAsignacionesService.updateHistoricoMensual(id, updateDto);
  }

  @Get(':id/historico')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener histórico mensual' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiQuery({ name: 'anio', required: false, description: 'Año (opcional)' })
  @ApiQuery({ name: 'mes', required: false, description: 'Mes (opcional, 1-12)' })
  @ApiResponse({ status: 200, description: 'Histórico mensual' })
  getHistoricoMensual(
    @Param('id') id: string,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
  ) {
    const anioNum = anio ? parseInt(anio) : undefined;
    const mesNum = mes ? parseInt(mes) : undefined;
    return this.nombramientoAsignacionesService.getHistoricoMensual(id, anioNum, mesNum);
  }

  @Patch(':id/finalizar')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Finalizar asignación (establecer fechaFin)' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación finalizada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  finalizar(@Param('id') id: string, @Body() finalizarDto: FinalizarAsignacionDto) {
    return this.nombramientoAsignacionesService.finalizar(id, finalizarDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar asignación' })
  @ApiParam({ name: 'id', description: 'ID de la asignación' })
  @ApiResponse({ status: 204, description: 'Asignación eliminada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  remove(@Param('id') id: string) {
    return this.nombramientoAsignacionesService.remove(id);
  }
}
