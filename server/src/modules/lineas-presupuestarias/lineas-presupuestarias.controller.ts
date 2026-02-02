import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LineasPresupuestariasService } from './lineas-presupuestarias.service';
import { CreateLineaPresupuestariaDto } from './dto/create-linea-presupuestaria.dto';
import { UpdateLineaPresupuestariaDto } from './dto/update-linea-presupuestaria.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Líneas Presupuestarias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lineas-presupuestarias')
export class LineasPresupuestariasController {
  constructor(private readonly lineasService: LineasPresupuestariasService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nueva línea presupuestaria' })
  @ApiResponse({
    status: 201,
    description: 'Línea creada correctamente',
  })
  @ApiResponse({ status: 409, description: 'Código duplicado' })
  create(@Body() createDto: CreateLineaPresupuestariaDto) {
    return this.lineasService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Listar todas las líneas presupuestarias' })
  @ApiQuery({
    name: 'vigente',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado vigente',
  })
  @ApiResponse({ status: 200, description: 'Lista de líneas' })
  findAll(@Query('vigente', new ParseBoolPipe({ optional: true })) vigente?: boolean) {
    return this.lineasService.findAll(vigente);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Obtener una línea por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la línea' })
  @ApiResponse({ status: 200, description: 'Línea encontrada' })
  @ApiResponse({ status: 404, description: 'Línea no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lineasService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar línea presupuestaria' })
  @ApiParam({ name: 'id', description: 'UUID de la línea' })
  @ApiResponse({ status: 200, description: 'Línea actualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLineaPresupuestariaDto,
  ) {
    return this.lineasService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar línea presupuestaria' })
  @ApiParam({ name: 'id', description: 'UUID de la línea' })
  @ApiResponse({ status: 200, description: 'Línea eliminada' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar por asignaciones asociadas',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lineasService.remove(id);
  }

  @Patch(':id/toggle-vigente')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Activar/desactivar vigencia de línea' })
  @ApiParam({ name: 'id', description: 'UUID de la línea' })
  @ApiResponse({ status: 200, description: 'Estado de vigencia actualizado' })
  toggleVigente(@Param('id', ParseUUIDPipe) id: string) {
    return this.lineasService.toggleVigente(id);
  }
}
