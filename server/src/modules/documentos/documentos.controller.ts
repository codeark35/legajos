import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';

@Controller('documentos')
@ApiTags('Documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  findAll() {
    return this.documentosService.findAll();
  }
}
