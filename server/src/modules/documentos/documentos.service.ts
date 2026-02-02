import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implementar lógica de documentos en Fase 3
  async findAll() {
    return { message: 'Módulo de documentos - Pendiente Fase 3' };
  }
}
