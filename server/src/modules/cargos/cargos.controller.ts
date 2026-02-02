import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('cargos')
@ApiTags('Cargos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nuevo cargo' })
  @ApiResponse({ status: 201, description: 'Cargo creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un cargo con ese nombre' })
  create(@Body() createCargoDto: CreateCargoDto) {
    return this.cargosService.create(createCargoDto);
  }

  @Get()
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Listar todos los cargos' })
  @ApiResponse({ status: 200, description: 'Lista de cargos' })
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS', 'CONSULTA', 'USUARIO')
  @ApiOperation({ summary: 'Obtener cargo por ID' })
  @ApiParam({ name: 'id', description: 'ID del cargo' })
  @ApiResponse({ status: 200, description: 'Cargo encontrado' })
  @ApiResponse({ status: 404, description: 'Cargo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar cargo' })
  @ApiParam({ name: 'id', description: 'ID del cargo' })
  @ApiResponse({ status: 200, description: 'Cargo actualizado' })
  @ApiResponse({ status: 404, description: 'Cargo no encontrado' })
  update(@Param('id') id: string, @Body() updateCargoDto: UpdateCargoDto) {
    return this.cargosService.update(id, updateCargoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar cargo' })
  @ApiParam({ name: 'id', description: 'ID del cargo' })
  @ApiResponse({ status: 204, description: 'Cargo eliminado' })
  @ApiResponse({ status: 404, description: 'Cargo no encontrado' })
  remove(@Param('id') id: string) {
    return this.cargosService.remove(id);
  }
}
