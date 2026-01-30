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
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { QueryPersonaDto } from './dto/query-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Personas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Crear nueva persona' })
  @ApiResponse({
    status: 201,
    description: 'Persona creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una persona con ese número de cédula',
  })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las personas con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de personas',
  })
  findAll(@Query() query: QueryPersonaDto) {
    return this.personasService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de personas' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de personas',
  })
  getStats() {
    return this.personasService.getStats();
  }

  @Get('cedula/:numeroCedula')
  @ApiOperation({ summary: 'Buscar persona por número de cédula' })
  @ApiParam({
    name: 'numeroCedula',
    description: 'Número de cédula de la persona',
    example: '1234567',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Persona no encontrada',
  })
  findByCedula(@Param('numeroCedula') numeroCedula: string) {
    return this.personasService.findByCedula(numeroCedula);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una persona por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la persona',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Persona no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RECURSOS_HUMANOS')
  @ApiOperation({ summary: 'Actualizar datos de una persona' })
  @ApiParam({
    name: 'id',
    description: 'ID de la persona',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Persona no encontrada',
  })
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar una persona (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la persona',
  })
  @ApiResponse({
    status: 200,
    description: 'Persona desactivada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Persona no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
