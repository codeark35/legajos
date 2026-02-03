import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NombramientosService } from './nombramientos.service';
import { CreateNombramientoDto } from './dto/create-nombramiento.dto';
import { UpdateNombramientoDto } from './dto/update-nombramiento.dto';
import { QueryNombramientosDto } from './dto/query-nombramientos.dto';
import { AgregarMesDto } from './dto/agregar-mes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('nombramientos')
@ApiTags('Nombramientos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NombramientosController {
  constructor(private readonly nombramientosService: NombramientosService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nuevo nombramiento' })
  @ApiResponse({ status: 201, description: 'Nombramiento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createNombramientoDto: CreateNombramientoDto) {
    return this.nombramientosService.create(createNombramientoDto);
  }

  @Get('legajos-completo')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({
    summary: 'Listar todos los legajos con sus nombramientos',
    description: 'Para vista accordion en frontend',
  })
  @ApiResponse({ status: 200, description: 'Lista de legajos con nombramientos' })
  findAllLegajosConNombramientos() {
    return this.nombramientosService.findAllLegajosConNombramientos();
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar nombramientos con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de nombramientos' })
  findAll(@Query() query: QueryNombramientosDto) {
    return this.nombramientosService.findAll(query);
  }

  @Get(':id/asignaciones-historico')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener histórico de asignaciones de un nombramiento (períodos agrupados)' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 200, description: 'Histórico de asignaciones agrupado' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  obtenerHistoricoAsignaciones(@Param('id') id: string) {
    return this.nombramientosService.obtenerHistoricoAsignaciones(id);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener nombramiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 200, description: 'Nombramiento encontrado' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.nombramientosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar nombramiento' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 200, description: 'Nombramiento actualizado' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateNombramientoDto: UpdateNombramientoDto,
  ) {
    return this.nombramientosService.update(id, updateNombramientoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar nombramiento' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 204, description: 'Nombramiento eliminado' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  remove(@Param('id') id: string) {
    return this.nombramientosService.remove(id);
  }

  @Get(':id/historico')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener histórico mensual completo de un nombramiento' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 200, description: 'Histórico mensual' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  getHistoricoMensual(@Param('id', ParseUUIDPipe) id: string) {
    return this.nombramientosService.getHistoricoMensual(id);
  }

  @Post(':id/agregar-mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Agregar un nuevo mes al histórico' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 201, description: 'Mes agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  @ApiResponse({ status: 409, description: 'El mes ya existe' })
  agregarMes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AgregarMesDto,
  ) {
    return this.nombramientosService.agregarMes(id, dto);
  }

  @Put(':id/mes/:anio/:mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar un mes existente en el histórico' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiParam({ name: 'anio', description: 'Año del mes' })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)' })
  @ApiResponse({ status: 200, description: 'Mes actualizado' })
  @ApiResponse({ status: 404, description: 'Nombramiento o mes no encontrado' })
  actualizarMes(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
    @Body() dto: AgregarMesDto,
  ) {
    return this.nombramientosService.actualizarMes(id, anio, mes, dto);
  }

  @Delete(':id/mes/:anio/:mes')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Eliminar un mes del histórico' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiParam({ name: 'anio', description: 'Año del mes' })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)' })
  @ApiResponse({ status: 200, description: 'Mes eliminado' })
  @ApiResponse({ status: 404, description: 'Nombramiento o mes no encontrado' })
  eliminarMes(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.nombramientosService.eliminarMes(id, anio, mes);
  }

  @Get(':id/resumen')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener resumen y estadísticas del nombramiento' })
  @ApiParam({ name: 'id', description: 'ID del nombramiento' })
  @ApiResponse({ status: 200, description: 'Resumen del nombramiento' })
  @ApiResponse({ status: 404, description: 'Nombramiento no encontrado' })
  getResumenNombramiento(@Param('id', ParseUUIDPipe) id: string) {
    return this.nombramientosService.getResumenNombramiento(id);
  }
}
