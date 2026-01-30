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
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { QueryCargoDto } from './dto/query-cargo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Cargos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nuevo cargo' })
  @ApiResponse({
    status: 201,
    description: 'Cargo creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un cargo con ese nombre',
  })
  create(@Body() createCargoDto: CreateCargoDto) {
    return this.cargosService.create(createCargoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los cargos con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de cargos',
  })
  findAll(@Query() query: QueryCargoDto) {
    return this.cargosService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de cargos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de cargos por nivel jerárquico',
  })
  getStats() {
    return this.cargosService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cargo' })
  @ApiParam({
    name: 'id',
    description: 'ID del cargo',
  })
  @ApiResponse({
    status: 200,
    description: 'Cargo encontrado con sus nombramientos',
  })
  @ApiResponse({
    status: 404,
    description: 'Cargo no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar datos de un cargo' })
  @ApiParam({
    name: 'id',
    description: 'ID del cargo',
  })
  @ApiResponse({
    status: 200,
    description: 'Cargo actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cargo no encontrado',
  })
  update(@Param('id') id: string, @Body() updateCargoDto: UpdateCargoDto) {
    return this.cargosService.update(id, updateCargoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un cargo' })
  @ApiParam({
    name: 'id',
    description: 'ID del cargo',
  })
  @ApiResponse({
    status: 200,
    description: 'Cargo eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cargo no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar porque tiene nombramientos asociados',
  })
  remove(@Param('id') id: string) {
    return this.cargosService.remove(id);
  }
}
