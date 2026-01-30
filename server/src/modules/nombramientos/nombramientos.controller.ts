import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { CreateNombramientoDto, CreateAsignacionSalarialDto } from './dto/create-nombramiento.dto';
import { UpdateNombramientoDto } from './dto/update-nombramiento.dto';
import { QueryNombramientoDto } from './dto/query-nombramiento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Nombramientos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nombramientos')
export class NombramientosController {
  constructor(private readonly nombramientosService: NombramientosService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nuevo nombramiento' })
  @ApiResponse({
    status: 201,
    description: 'Nombramiento creado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Legajo no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Fechas inválidas',
  })
  create(@Body() createNombramientoDto: CreateNombramientoDto) {
    return this.nombramientosService.create(createNombramientoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los nombramientos con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de nombramientos',
  })
  findAll(@Query() query: QueryNombramientoDto) {
    return this.nombramientosService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de nombramientos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de nombramientos por estado',
  })
  getStats() {
    return this.nombramientosService.getStats();
  }

  @Get('vigentes')
  @ApiOperation({ summary: 'Listar solo nombramientos vigentes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de nombramientos vigentes',
  })
  findVigentes() {
    return this.nombramientosService.findVigentes();
  }

  @Get('legajo/:legajoId')
  @ApiOperation({ summary: 'Obtener todos los nombramientos de un legajo' })
  @ApiParam({
    name: 'legajoId',
    description: 'ID del legajo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de nombramientos del legajo',
  })
  findByLegajo(@Param('legajoId') legajoId: string) {
    return this.nombramientosService.findByLegajo(legajoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un nombramiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del nombramiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Nombramiento encontrado con asignaciones salariales',
  })
  @ApiResponse({
    status: 404,
    description: 'Nombramiento no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.nombramientosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar datos de un nombramiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del nombramiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Nombramiento actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Nombramiento no encontrado',
  })
  update(@Param('id') id: string, @Body() updateNombramientoDto: UpdateNombramientoDto) {
    return this.nombramientosService.update(id, updateNombramientoDto);
  }

  @Patch(':id/finalizar')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar un nombramiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del nombramiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Nombramiento finalizado exitosamente',
  })
  finalizarNombramiento(
    @Param('id') id: string,
    @Body() body?: { fechaFin?: string },
  ) {
    return this.nombramientosService.finalizarNombramiento(id, body?.fechaFin);
  }

  @Post(':id/asignaciones')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Agregar asignación salarial a un nombramiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del nombramiento',
  })
  @ApiResponse({
    status: 201,
    description: 'Asignación salarial creada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Nombramiento no encontrado',
  })
  agregarAsignacionSalarial(
    @Param('id') id: string,
    @Body() createAsignacionDto: CreateAsignacionSalarialDto,
  ) {
    return this.nombramientosService.agregarAsignacionSalarial(id, createAsignacionDto);
  }
}
