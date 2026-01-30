import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes en orden correcto (respetando foreign keys)
  console.log('🧹 Limpiando datos existentes...');
  await prisma.asignacionSalarial.deleteMany({});
  await prisma.nombramiento.deleteMany({});
  await prisma.documento.deleteMany({});
  await prisma.historialCambio.deleteMany({});
  await prisma.legajo.deleteMany({});
  await prisma.persona.deleteMany({});
  await prisma.cargo.deleteMany({});
  await prisma.facultad.deleteMany({});
  await prisma.resolucion.deleteMany({});
  await prisma.categoriaPresupuestaria.deleteMany({});
  await prisma.usuario.deleteMany({});
  console.log('✅ Datos limpiados correctamente');

  // 1. Crear Categorías Presupuestarias
  console.log('📊 Creando categorías presupuestarias...');
  const categorias = await Promise.all([
    prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: 'L33',
        descripcion: 'Categoría L33 - Docente Técnico',
        rangoSalarialMin: 2500000,
        rangoSalarialMax: 3500000,
        vigente: true,
      },
    }),
    prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: 'UU5',
        descripcion: 'Categoría UU5 - Director de Carrera',
        rangoSalarialMin: 3500000,
        rangoSalarialMax: 4500000,
        vigente: true,
      },
    }),
    prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: 'L23',
        descripcion: 'Categoría L23 - Encargado de Cátedra',
        rangoSalarialMin: 1000000,
        rangoSalarialMax: 1500000,
        vigente: true,
      },
    }),
    prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: 'B06',
        descripcion: 'Categoría B06 - Auxiliar de Enseñanza',
        rangoSalarialMin: 200000,
        rangoSalarialMax: 400000,
        vigente: true,
      },
    }),
    prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: 'L11',
        descripcion: 'Categoría L11 - Encargado de Cátedra',
        rangoSalarialMin: 600000,
        rangoSalarialMax: 900000,
        vigente: true,
      },
    }),
    prisma.categoriaPresupuestaria.create({
      data: {
        codigoCategoria: 'L06',
        descripcion: 'Categoría L06 - Profesor de Macroeconomía',
        rangoSalarialMin: 400000,
        rangoSalarialMax: 700000,
        vigente: true,
      },
    }),
  ]);
  console.log(`✅ ${categorias.length} categorías presupuestarias creadas`);

  // 2. Crear Facultades
  console.log('🏛️ Creando facultades...');
  const facultades = await Promise.all([
    prisma.facultad.create({
      data: {
        nombreFacultad: 'Facultad de Ciencias Económicas y Administrativas',
        codigo: 'FCEA',
        tipo: 'FACULTAD',
        descripcion: 'Facultad de Ciencias Económicas y Administrativas',
      },
    }),
    prisma.facultad.create({
      data: {
        nombreFacultad: 'Facultad de Ingeniería',
        codigo: 'FI',
        tipo: 'FACULTAD',
        descripcion: 'Facultad de Ingeniería',
      },
    }),
    prisma.facultad.create({
      data: {
        nombreFacultad: 'Facultad de Derecho',
        codigo: 'FD',
        tipo: 'FACULTAD',
        descripcion: 'Facultad de Derecho y Ciencias Sociales',
      },
    }),
    prisma.facultad.create({
      data: {
        nombreFacultad: 'Rectorado',
        codigo: 'RECT',
        tipo: 'DIRECCION',
        descripcion: 'Rectorado de la Universidad',
      },
    }),
  ]);
  console.log(`✅ ${facultades.length} facultades creadas`);

  // 3. Crear Cargos
  console.log('💼 Creando cargos...');
  const cargos = await Promise.all([
    prisma.cargo.create({
      data: {
        nombreCargo: 'Docente Técnico',
        descripcion: 'Cargo de docente con especialización técnica',
        nivelJerarquico: 3,
        departamentoArea: 'Docencia',
      },
    }),
    prisma.cargo.create({
      data: {
        nombreCargo: 'Director de Carrera',
        descripcion: 'Director de una carrera universitaria',
        nivelJerarquico: 5,
        departamentoArea: 'Gestión Académica',
      },
    }),
    prisma.cargo.create({
      data: {
        nombreCargo: 'Encargado de Cátedra',
        descripcion: 'Docente encargado de una cátedra específica',
        nivelJerarquico: 4,
        departamentoArea: 'Docencia',
      },
    }),
    prisma.cargo.create({
      data: {
        nombreCargo: 'Auxiliar de Enseñanza',
        descripcion: 'Asistente docente',
        nivelJerarquico: 2,
        departamentoArea: 'Docencia',
      },
    }),
    prisma.cargo.create({
      data: {
        nombreCargo: 'Profesor de Macroeconomía',
        descripcion: 'Docente especializado en Macroeconomía',
        nivelJerarquico: 3,
        departamentoArea: 'Docencia',
      },
    }),
  ]);
  console.log(`✅ ${cargos.length} cargos creados`);

  // 4. Crear ejemplo de Persona basado en el documento
  console.log('👤 Creando persona de ejemplo...');
  const persona = await prisma.persona.create({
    data: {
      numeroCedula: '1.716.738',
      nombres: 'María Nieves Florentín',
      apellidos: 'Núñez',
      fechaNacimiento: new Date('1970-01-01'),
      direccion: 'Encarnación, Paraguay',
      telefono: '(059571) 206 990',
      email: 'mnunez@unae.edu.py',
      estado: 'ACTIVO',
    },
  });
  console.log('✅ Persona creada:', persona.nombres, persona.apellidos);

  // 5. Crear Legajo
  console.log('📁 Creando legajo...');
  const legajo = await prisma.legajo.create({
    data: {
      numeroLegajo: 'LEG-2001-001',
      personaId: persona.id,
      tipoLegajo: 'DOCENTE',
      facultadId: facultades[0].id, // FCEA
      fechaApertura: new Date('2001-02-01'),
      estadoLegajo: 'ACTIVO',
      observaciones: 'Legajo correspondiente a docente de Facultad de Ciencias Económicas',
    },
  });
  console.log('✅ Legajo creado:', legajo.numeroLegajo);

  // 6. Crear Resolución
  console.log('📜 Creando resolución...');
  const resolucion = await prisma.resolucion.create({
    data: {
      numeroResolucion: 'RES-2001-123',
      fechaResolucion: new Date('2001-01-15'),
      tipoResolucion: 'Nombramiento Docente',
      descripcion: 'Resolución de nombramiento como docente',
      autoridadFirmante: 'Rector de la Universidad Nacional de Itapúa',
    },
  });
  console.log('✅ Resolución creada:', resolucion.numeroResolucion);

  // 7. Crear Nombramientos basados en el documento LEGAJO
  console.log('📋 Creando nombramientos...');
  
  // Nombramiento 1: Encargado de Cátedra (Feb-Jun 2001)
  const nombramiento1 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[2].id, // Encargado de Cátedra
      tipoNombramiento: 'Encargado de Cátedra',
      categoria: 'L23',
      fechaInicio: new Date('2001-02-01'),
      fechaFin: new Date('2001-06-30'),
      resolucionId: resolucion.id,
      salarioMensual: 1127400,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
      observaciones: 'Primer nombramiento como Encargado de Cátedra',
    },
  });

  // Crear asignación salarial para nombramiento 1
  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento1.id,
      categoriaPresupuestariaId: categorias[2].id, // L23
      categoriaPresupuestaria: 'L23',
      monto: 1127400,
      moneda: 'PYG',
      fechaDesde: new Date('2001-02-01'),
      fechaHasta: new Date('2001-06-30'),
      descripcion: 'Guaraníes un millón ciento veintisiete mil cuatrocientos',
    },
  });

  // Nombramiento 2: Auxiliar de Enseñanza (Abr-Dic 2001)
  const nombramiento2 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[3].id, // Auxiliar de Enseñanza
      tipoNombramiento: 'Auxiliar de Enseñanza',
      categoria: 'B06',
      fechaInicio: new Date('2001-04-01'),
      fechaFin: new Date('2001-12-31'),
      salarioMensual: 272900,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
      observaciones: 'Nombramiento simultáneo como Auxiliar de Enseñanza',
    },
  });

  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento2.id,
      categoriaPresupuestariaId: categorias[3].id, // B06
      categoriaPresupuestaria: 'B06',
      monto: 272900,
      moneda: 'PYG',
      fechaDesde: new Date('2001-04-01'),
      fechaHasta: new Date('2001-12-31'),
      descripcion: 'Guaraníes doscientos setenta y dos mil novecientos',
    },
  });

  // Nombramiento 3: Encargado de Cátedra (Jul-Dic 2001)
  const nombramiento3 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[2].id, // Encargado de Cátedra
      tipoNombramiento: 'Encargado de Cátedra',
      categoria: 'L11',
      fechaInicio: new Date('2001-07-01'),
      fechaFin: new Date('2001-12-31'),
      salarioMensual: 707600,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
      observaciones: 'Continuación como Encargado de Cátedra con nueva categoría',
    },
  });

  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento3.id,
      categoriaPresupuestariaId: categorias[4].id, // L11
      categoriaPresupuestaria: 'L11',
      monto: 707600,
      moneda: 'PYG',
      fechaDesde: new Date('2001-07-01'),
      fechaHasta: new Date('2001-12-31'),
      descripcion: 'Guaraníes setecientos siete mil seiscientos',
    },
  });

  // Nombramientos de 2002
  // Nombramiento 4: Encargado de Cátedra (Feb-Jun 2002)
  const nombramiento4 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[2].id,
      tipoNombramiento: 'Encargado de Cátedra',
      categoria: 'L23',
      fechaInicio: new Date('2002-02-01'),
      fechaFin: new Date('2002-06-30'),
      salarioMensual: 1127400,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
    },
  });

  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento4.id,
      categoriaPresupuestariaId: categorias[2].id,
      categoriaPresupuestaria: 'L23',
      monto: 1127400,
      moneda: 'PYG',
      fechaDesde: new Date('2002-02-01'),
      fechaHasta: new Date('2002-06-30'),
    },
  });

  // Nombramiento 5: Auxiliar de Enseñanza (Feb-Dic 2002)
  const nombramiento5 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[3].id,
      tipoNombramiento: 'Auxiliar de Enseñanza',
      categoria: 'B06',
      fechaInicio: new Date('2002-02-01'),
      fechaFin: new Date('2002-12-31'),
      salarioMensual: 272900,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
    },
  });

  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento5.id,
      categoriaPresupuestariaId: categorias[3].id,
      categoriaPresupuestaria: 'B06',
      monto: 272900,
      moneda: 'PYG',
      fechaDesde: new Date('2002-02-01'),
      fechaHasta: new Date('2002-12-31'),
    },
  });

  // Nombramiento 6: Encargado de Cátedra (Jul-Dic 2002)
  const nombramiento6 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[2].id,
      tipoNombramiento: 'Encargado de Cátedra',
      categoria: 'L11',
      fechaInicio: new Date('2002-07-01'),
      fechaFin: new Date('2002-12-31'),
      salarioMensual: 707600,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
    },
  });

  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento6.id,
      categoriaPresupuestariaId: categorias[4].id,
      categoriaPresupuestaria: 'L11',
      monto: 707600,
      moneda: 'PYG',
      fechaDesde: new Date('2002-07-01'),
      fechaHasta: new Date('2002-12-31'),
    },
  });

  // Nombramiento 7: Profesor de Macroeconomía (Jul-Dic 2002)
  const nombramiento7 = await prisma.nombramiento.create({
    data: {
      legajoId: legajo.id,
      cargoId: cargos[4].id,
      tipoNombramiento: 'Profesor de Macroeconomía',
      categoria: 'L06',
      fechaInicio: new Date('2002-07-01'),
      fechaFin: new Date('2002-12-31'),
      salarioMensual: 524000,
      moneda: 'PYG',
      estadoNombramiento: 'FINALIZADO',
    },
  });

  await prisma.asignacionSalarial.create({
    data: {
      nombramientoId: nombramiento7.id,
      categoriaPresupuestariaId: categorias[5].id,
      categoriaPresupuestaria: 'L06',
      monto: 524000,
      moneda: 'PYG',
      fechaDesde: new Date('2002-07-01'),
      fechaHasta: new Date('2002-12-31'),
      descripcion: 'Guaraníes quinientos veinticuatro mil',
    },
  });

  console.log('✅ 7 nombramientos creados con sus asignaciones salariales');

  // 8. Crear Usuario Administrador
  console.log('👨‍💼 Creando usuario administrador...');
  const usuario = await prisma.usuario.create({
    data: {
      email: 'admin@unae.edu.py',
      nombreUsuario: 'Administrador',
      passwordHash: '$2b$10$ExampleHashPasswordNeverUseThisInProduction',
      rol: 'ADMIN',
      activo: true,
    },
  });
  console.log('✅ Usuario creado:', usuario.email);

  // 9. Crear registro de historial de ejemplo
  console.log('📝 Creando registro de auditoría...');
  await prisma.historialCambio.create({
    data: {
      tablaAfectada: 'nombramientos',
      idRegistroAfectado: nombramiento1.id,
      campoModificado: 'estadoNombramiento',
      valorAnterior: 'VIGENTE',
      valorNuevo: 'FINALIZADO',
      usuarioModificacion: usuario.email,
      motivo: 'Finalización del período de nombramiento',
      ipAddress: '127.0.0.1',
    },
  });
  console.log('✅ Registro de auditoría creado');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`  - ${categorias.length} categorías presupuestarias`);
  console.log(`  - ${facultades.length} facultades`);
  console.log(`  - ${cargos.length} cargos`);
  console.log(`  - 1 persona`);
  console.log(`  - 1 legajo`);
  console.log(`  - 7 nombramientos`);
  console.log(`  - 7 asignaciones salariales`);
  console.log(`  - 1 usuario`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
