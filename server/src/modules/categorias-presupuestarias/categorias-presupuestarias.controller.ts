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
import { CategoriasPresupuestariasService } from './categorias-presupuestarias.service';
import { CreateCategoriaPresupuestariaDto } from './dto/create-categoria-presupuestaria.dto';
import { UpdateCategoriaPresupuestariaDto } from './dto/update-categoria-presupuestaria.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Categorías Presupuestarias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categorias-presupuestarias')
export class CategoriasPresupuestariasController {
  constructor(
    private readonly categoriasService: CategoriasPresupuestariasService,
  ) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nueva categoría presupuestaria' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada correctamente',
  })
  @ApiResponse({ status: 409, description: 'Código duplicado' })
  create(@Body() createDto: CreateCategoriaPresupuestariaDto) {
    return this.categoriasService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Listar todas las categorías presupuestarias' })
  @ApiQuery({
    name: 'vigente',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado vigente',
  })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  findAll(@Query('vigente', new ParseBoolPipe({ optional: true })) vigente?: boolean) {
    return this.categoriasService.findAll(vigente);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar categoría presupuestaria' })
  @ApiParam({ name: 'id', description: 'UUID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCategoriaPresupuestariaDto,
  ) {
    return this.categoriasService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar categoría presupuestaria' })
  @ApiParam({ name: 'id', description: 'UUID de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar por asignaciones asociadas',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.remove(id);
  }

  @Patch(':id/toggle-vigente')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Activar/desactivar vigencia de categoría' })
  @ApiParam({ name: 'id', description: 'UUID de la categoría' })
  @ApiResponse({ status: 200, description: 'Estado de vigencia actualizado' })
  toggleVigente(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.toggleVigente(id);
  }
}
