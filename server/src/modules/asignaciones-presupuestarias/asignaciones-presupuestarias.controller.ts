import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AsignacionesPresupuestariasService } from './asignaciones-presupuestarias.service';
import { CreateAsignacionPresupuestariaDto } from './dto/create-asignacion-presupuestaria.dto';
import { UpdateAsignacionPresupuestariaDto } from './dto/update-asignacion-presupuestaria.dto';
import { HistoricoMensualDto } from './dto/historico-mensual.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Asignaciones Presupuestarias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('asignaciones-presupuestarias')
export class AsignacionesPresupuestariasController {
  constructor(
    private readonly asignacionesService: AsignacionesPresupuestariasService,
  ) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nueva asignación presupuestaria' })
  @ApiResponse({
    status: 201,
    description: 'Asignación presupuestaria creada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El nombramiento ya tiene asignación' })
  create(@Body() createDto: CreateAsignacionPresupuestariaDto) {
    return this.asignacionesService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Listar todas las asignaciones presupuestarias' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  findAll() {
    return this.asignacionesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.asignacionesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar asignación presupuestaria' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación actualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAsignacionPresupuestariaDto,
  ) {
    return this.asignacionesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar asignación presupuestaria' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.asignacionesService.remove(id);
  }

  // ============================================================================
  // ENDPOINTS PARA HISTÓRICO MENSUAL
  // ============================================================================

  @Get(':id/historico')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Obtener histórico completo de una asignación' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiResponse({
    status: 200,
    description: 'Histórico completo con todos los años y meses',
  })
  obtenerHistorico(@Param('id', ParseUUIDPipe) id: string) {
    return this.asignacionesService.obtenerHistorico(id);
  }

  @Get(':id/historico/:anio')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Obtener resumen anual con totales' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiParam({
    name: 'anio',
    description: 'Año a consultar (2000-2100)',
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen del año con totales mensuales',
  })
  obtenerResumenAnual(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
  ) {
    return this.asignacionesService.obtenerResumenAnual(id, anio);
  }

  @Get(':id/historico/:anio/:mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Obtener datos de un mes específico' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiParam({
    name: 'anio',
    description: 'Año (2000-2100)',
    example: 2024,
  })
  @ApiParam({
    name: 'mes',
    description: 'Mes (1-12)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del mes solicitado',
  })
  @ApiResponse({
    status: 404,
    description: 'No hay datos para ese mes',
  })
  obtenerMes(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.asignacionesService.obtenerMes(id, anio, mes);
  }

  @Post(':id/historico/:anio/:mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({
    summary: 'Agregar o actualizar datos de un mes en el histórico',
  })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiParam({
    name: 'anio',
    description: 'Año (2000-2100)',
    example: 2024,
  })
  @ApiParam({
    name: 'mes',
    description: 'Mes (1-12)',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Datos del mes agregados al histórico',
  })
  @ApiResponse({
    status: 400,
    description: 'Año o mes inválido',
  })
  agregarMes(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
    @Body() datos: HistoricoMensualDto,
    @CurrentUser() user: any,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.asignacionesService.agregarMes(
      id,
      anio,
      mes,
      datos,
      user?.id,
      ipAddress,
    );
  }

  @Delete(':id/historico/:anio/:mes')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un mes del histórico' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiParam({ name: 'anio', description: 'Año', example: 2024 })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Mes eliminado del histórico',
  })
  @ApiResponse({
    status: 404,
    description: 'No hay datos para ese mes',
  })
  eliminarMes(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
    @CurrentUser() user: any,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.asignacionesService.eliminarMes(
      id,
      anio,
      mes,
      user?.id,
      ipAddress,
    );
  }

  // ============================================================================
  // ENDPOINTS DE AUDITORÍA
  // ============================================================================

  @Get(':id/auditoria')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Obtener historial de auditoría de una asignación' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiResponse({
    status: 200,
    description: 'Historial de cambios registrados',
  })
  obtenerHistorialAuditoria(@Param('id', ParseUUIDPipe) id: string) {
    return this.asignacionesService.obtenerHistorialAuditoria(id);
  }

  @Get(':id/auditoria/:anio/:mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Obtener auditoría de un mes específico' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación' })
  @ApiParam({ name: 'anio', description: 'Año', example: 2024 })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Historial de cambios del mes',
  })
  obtenerHistorialMesAuditoria(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.asignacionesService.obtenerHistorialMesAuditoria(id, anio, mes);
  }
}
