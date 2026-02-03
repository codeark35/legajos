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
import { NombramientosService } from './nombramientos.service';
import { CreateNombramientoDto } from './dto/create-nombramiento.dto';
import { UpdateNombramientoDto } from './dto/update-nombramiento.dto';
import { QueryNombramientosDto } from './dto/query-nombramientos.dto';
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

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar nombramientos con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de nombramientos' })
  findAll(@Query() query: QueryNombramientosDto) {
    return this.nombramientosService.findAll(query);
  }

  @Get('sin-asignacion')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar nombramientos sin asignación presupuestaria' })
  @ApiResponse({ status: 200, description: 'Lista de nombramientos sin asignación' })
  findSinAsignacion() {
    return this.nombramientosService.findSinAsignacion();
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
}
