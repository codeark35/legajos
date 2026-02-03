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
import { QueryLegajosDto } from './dto/query-legajos.dto';
import { QueryFuncionariosDto } from './dto/query-funcionarios.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('legajos')
@ApiTags('Legajos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LegajosController {
  constructor(private readonly legajosService: LegajosService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nuevo legajo' })
  @ApiResponse({ status: 201, description: 'Legajo creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El número de legajo ya está en uso' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createLegajoDto: CreateLegajoDto) {
    return this.legajosService.create(createLegajoDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar legajos con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de legajos' })
  findAll(@Query() query: QueryLegajosDto) {
    return this.legajosService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener legajo por ID' })
  @ApiParam({ name: 'id', description: 'ID del legajo' })
  @ApiResponse({ status: 200, description: 'Legajo encontrado' })
  @ApiResponse({ status: 404, description: 'Legajo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.legajosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar legajo' })
  @ApiParam({ name: 'id', description: 'ID del legajo' })
  @ApiResponse({ status: 200, description: 'Legajo actualizado' })
  @ApiResponse({ status: 404, description: 'Legajo no encontrado' })
  update(@Param('id') id: string, @Body() updateLegajoDto: UpdateLegajoDto) {
    return this.legajosService.update(id, updateLegajoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar legajo' })
  @ApiParam({ name: 'id', description: 'ID del legajo' })
  @ApiResponse({ status: 204, description: 'Legajo eliminado' })
  @ApiResponse({ status: 404, description: 'Legajo no encontrado' })
  remove(@Param('id') id: string) {
    return this.legajosService.remove(id);
  }

  @Get('funcionarios-completo')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({
    summary: 'Listar funcionarios completos para vista de accordion',
    description:
      'Retorna lista de funcionarios con datos básicos, legajo y nombramiento vigente. ' +
      'El histórico mensual se carga bajo demanda al expandir el accordion.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de funcionarios con datos básicos (sin histórico mensual)',
  })
  findAllFuncionarios(@Query() query: QueryFuncionariosDto) {
    return this.legajosService.findAllFuncionarios(query);
  }
}
