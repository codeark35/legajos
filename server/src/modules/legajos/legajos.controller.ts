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
import { LegajosService } from './legajos.service';
import { CreateLegajoDto } from './dto/create-legajo.dto';
import { UpdateLegajoDto } from './dto/update-legajo.dto';
import { QueryLegajoDto } from './dto/query-legajo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Legajos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('legajos')
export class LegajosController {
  constructor(private readonly legajosService: LegajosService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nuevo legajo' })
  @ApiResponse({
    status: 201,
    description: 'Legajo creado exitosamente con número automático',
  })
  @ApiResponse({
    status: 404,
    description: 'Persona o facultad no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'La persona ya tiene un legajo activo de ese tipo',
  })
  create(@Body() createLegajoDto: CreateLegajoDto) {
    return this.legajosService.create(createLegajoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los legajos con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de legajos',
  })
  findAll(@Query() query: QueryLegajoDto) {
    return this.legajosService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de legajos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de legajos por estado y tipo',
  })
  getStats() {
    return this.legajosService.getStats();
  }

  @Get('numero/:numeroLegajo')
  @ApiOperation({ summary: 'Buscar legajo por número' })
  @ApiParam({
    name: 'numeroLegajo',
    description: 'Número del legajo',
    example: 'LEG-2026-0001',
  })
  @ApiResponse({
    status: 200,
    description: 'Legajo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Legajo no encontrado',
  })
  findByNumero(@Param('numeroLegajo') numeroLegajo: string) {
    return this.legajosService.findByNumero(numeroLegajo);
  }

  @Get('persona/:personaId')
  @ApiOperation({ summary: 'Obtener todos los legajos de una persona' })
  @ApiParam({
    name: 'personaId',
    description: 'ID de la persona',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de legajos de la persona',
  })
  findByPersona(@Param('personaId') personaId: string) {
    return this.legajosService.findByPersona(personaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un legajo' })
  @ApiParam({
    name: 'id',
    description: 'ID del legajo',
  })
  @ApiResponse({
    status: 200,
    description: 'Legajo encontrado con nombramientos y documentos',
  })
  @ApiResponse({
    status: 404,
    description: 'Legajo no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.legajosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar datos de un legajo' })
  @ApiParam({
    name: 'id',
    description: 'ID del legajo',
  })
  @ApiResponse({
    status: 200,
    description: 'Legajo actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Legajo no encontrado',
  })
  update(@Param('id') id: string, @Body() updateLegajoDto: UpdateLegajoDto) {
    return this.legajosService.update(id, updateLegajoDto);
  }

  @Patch(':id/estado/:nuevoEstado')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Cambiar estado de un legajo' })
  @ApiParam({
    name: 'id',
    description: 'ID del legajo',
  })
  @ApiParam({
    name: 'nuevoEstado',
    description: 'Nuevo estado del legajo',
    enum: ['ACTIVO', 'CERRADO', 'SUSPENDIDO', 'ARCHIVADO'],
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del legajo actualizado',
  })
  changeEstado(
    @Param('id') id: string,
    @Param('nuevoEstado') nuevoEstado: string,
  ) {
    return this.legajosService.changeEstado(id, nuevoEstado);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archivar un legajo (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del legajo',
  })
  @ApiResponse({
    status: 200,
    description: 'Legajo archivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Legajo no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.legajosService.remove(id);
  }
}
