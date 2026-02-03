import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...');
  await prisma.historialCambio.deleteMany({});
  await prisma.asignacionPresupuestaria.deleteMany({});
  await prisma.nombramiento.deleteMany({});
  await prisma.documento.deleteMany({});
  await prisma.legajo.deleteMany({});
  await prisma.persona.deleteMany({});
  await prisma.cargo.deleteMany({});
  await prisma.facultad.deleteMany({});
  await prisma.resolucion.deleteMany({});
  await prisma.lineaPresupuestaria.deleteMany({});
  await prisma.categoriaPresupuestaria.deleteMany({});
  await prisma.usuario.deleteMany({});
  console.log('✅ Datos limpiados correctamente');

  // 1. Crear Usuarios (primero para tener referencias)
  console.log('👨‍💼 Creando usuarios...');
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  
  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        email: 'admin@unae.edu.py',
        nombreUsuario: 'Administrador',
        passwordHash: passwordHash,
        rol: 'ADMIN',
        activo: true,
      },
    }),
    prisma.usuario.create({
      data: {
        email: 'usuario@unae.edu.py',
        nombreUsuario: 'Usuario Regular',
        passwordHash: await bcrypt.hash('Usuario123!', 10),
        rol: 'USUARIO',
        activo: true,
      },
    }),
  ]);
  console.log(`✅ ${usuarios.length} usuarios creados`);

  // 2. Crear Categorías Presupuestarias
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
  ]);
  console.log(`✅ ${categorias.length} categorías presupuestarias creadas`);

  // 3. Crear Líneas Presupuestarias
  console.log('💰 Creando líneas presupuestarias...');
  const lineas = await Promise.all([
    prisma.lineaPresupuestaria.create({
      data: {
        codigoLinea: '100',
        descripcion: 'Personal Docente',
        tipo: 'DOCENTE',
        vigente: true,
      },
    }),
    prisma.lineaPresupuestaria.create({
      data: {
        codigoLinea: '200',
        descripcion: 'Personal Administrativo',
        tipo: 'ADMINISTRATIVO',
        vigente: true,
      },
    }),
    prisma.lineaPresupuestaria.create({
      data: {
        codigoLinea: '300',
        descripcion: 'Personal Técnico',
        tipo: 'TECNICO',
        vigente: true,
      },
    }),
  ]);
  console.log(`✅ ${lineas.length} líneas presupuestarias creadas`);

  // 4. Crear Facultades
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

  // 5. Crear Cargos
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
        nombreCargo: 'Profesor',
        descripcion: 'Docente de cátedra',
        nivelJerarquico: 3,
        departamentoArea: 'Docencia',
      },
    }),
  ]);
  console.log(`✅ ${cargos.length} cargos creados`);

  // 6. Crear Personas
  console.log('👤 Creando personas de ejemplo...');
  const personas = await Promise.all([
    prisma.persona.create({
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
    }),
    prisma.persona.create({
      data: {
        numeroCedula: '2.345.678',
        nombres: 'Juan Carlos',
        apellidos: 'González López',
        fechaNacimiento: new Date('1975-03-15'),
        direccion: 'Encarnación, Paraguay',
        telefono: '(059571) 208 123',
        email: 'jgonzalez@unae.edu.py',
        estado: 'ACTIVO',
      },
    }),
    prisma.persona.create({
      data: {
        numeroCedula: '3.456.789',
        nombres: 'Ana María',
        apellidos: 'Fernández Silva',
        fechaNacimiento: new Date('1982-07-22'),
        direccion: 'Encarnación, Paraguay',
        telefono: '(059571) 209 456',
        email: 'afernandez@unae.edu.py',
        estado: 'ACTIVO',
      },
    }),
    prisma.persona.create({
      data: {
        numeroCedula: '4.567.890',
        nombres: 'Roberto',
        apellidos: 'Martínez Pérez',
        fechaNacimiento: new Date('1968-11-05'),
        direccion: 'Encarnación, Paraguay',
        telefono: '(059571) 210 789',
        email: 'rmartinez@unae.edu.py',
        estado: 'ACTIVO',
      },
    }),
    prisma.persona.create({
      data: {
        numeroCedula: '5.678.901',
        nombres: 'Laura Beatriz',
        apellidos: 'Rodríguez Benítez',
        fechaNacimiento: new Date('1990-02-14'),
        direccion: 'Encarnación, Paraguay',
        telefono: '(059571) 211 012',
        email: 'lrodriguez@unae.edu.py',
        estado: 'ACTIVO',
      },
    }),
  ]);
  console.log(`✅ ${personas.length} personas creadas`);

  // 7. Crear Legajos
  console.log('📁 Creando legajos...');
  const legajos = await Promise.all([
    prisma.legajo.create({
      data: {
        numeroLegajo: 'LEG-2001-001',
        personaId: personas[0].id,
        tipoLegajo: 'DOCENTE',
        facultadId: facultades[0].id,
        fechaApertura: new Date('2001-02-01'),
        estadoLegajo: 'ACTIVO',
        observaciones: 'Legajo correspondiente a docente de Facultad de Ciencias Económicas',
      },
    }),
    prisma.legajo.create({
      data: {
        numeroLegajo: 'LEG-2005-045',
        personaId: personas[1].id,
        tipoLegajo: 'DOCENTE',
        facultadId: facultades[1].id,
        fechaApertura: new Date('2005-03-01'),
        estadoLegajo: 'ACTIVO',
        observaciones: 'Legajo de docente de Ingeniería',
      },
    }),
    prisma.legajo.create({
      data: {
        numeroLegajo: 'LEG-2010-123',
        personaId: personas[2].id,
        tipoLegajo: 'ADMINISTRATIVO',
        facultadId: facultades[3].id,
        fechaApertura: new Date('2010-06-15'),
        estadoLegajo: 'ACTIVO',
        observaciones: 'Legajo administrativo de Rectorado',
      },
    }),
    prisma.legajo.create({
      data: {
        numeroLegajo: 'LEG-1998-015',
        personaId: personas[3].id,
        tipoLegajo: 'DOCENTE',
        facultadId: facultades[2].id,
        fechaApertura: new Date('1998-08-01'),
        estadoLegajo: 'ACTIVO',
        observaciones: 'Legajo de docente de Derecho',
      },
    }),
    prisma.legajo.create({
      data: {
        numeroLegajo: 'LEG-2015-200',
        personaId: personas[4].id,
        tipoLegajo: 'DOCENTE',
        facultadId: facultades[0].id,
        fechaApertura: new Date('2015-02-20'),
        estadoLegajo: 'ACTIVO',
        observaciones: 'Legajo de docente reciente',
      },
    }),
  ]);
  console.log(`✅ ${legajos.length} legajos creados`);

  // 8. Crear Resolución
  console.log('📜 Creando resolución...');
  const resolucion = await prisma.resolucion.create({
    data: {
      numeroResolucion: 'RES-2026-001',
      fechaResolucion: new Date('2026-01-15'),
      tipoResolucion: 'Nombramiento Docente',
      descripcion: 'Resolución de nombramiento como docente',
      autoridadFirmante: 'Rector de la Universidad Nacional de Itapúa',
    },
  });
  console.log('✅ Resolución creada:', resolucion.numeroResolucion);

  // 9. Crear Nombramientos con AsignacionPresupuestaria
  console.log('📋 Creando nombramientos con asignaciones...');

  // Nombramiento 1
  const nombramiento1 = await prisma.nombramiento.create({
    data: {
      legajoId: legajos[0].id,
      cargoId: cargos[0].id,
      tipoNombramiento: 'Docente Técnico',
      categoria: 'L33',
      fechaInicio: new Date('2026-01-01'),
      resolucionId: resolucion.id,
      salarioBase: 2800000,
      moneda: 'PYG',
      vigente: true,
      estadoNombramiento: 'VIGENTE',
      observaciones: 'Nombramiento vigente como Docente Técnico',
    },
  });

  await prisma.asignacionPresupuestaria.create({
    data: {
      nombramientoId: nombramiento1.id,
      categoriaPresupuestariaId: categorias[0].id,
      lineaPresupuestariaId: lineas[0].id,
      objetoGasto: '110',
      salarioBase: 2800000,
      moneda: 'PYG',
      historicoMensual: {
        '2026': {
          '01': {
            presupuestado: 2800000,
            devengado: 2800000,
            horasExtras: 0,
            bonificaciones: 0,
            descuentos: 0,
            montoTotal: 2800000,
          },
        },
      },
      usuarioUltimaActualizacion: usuarios[0].email,
    },
  });

  // Nombramiento 2
  const nombramiento2 = await prisma.nombramiento.create({
    data: {
      legajoId: legajos[1].id,
      cargoId: cargos[1].id,
      tipoNombramiento: 'Director de Carrera',
      categoria: 'UU5',
      fechaInicio: new Date('2025-03-01'),
      resolucionId: resolucion.id,
      salarioBase: 4000000,
      moneda: 'PYG',
      vigente: true,
      estadoNombramiento: 'VIGENTE',
      observaciones: 'Director de Ingeniería',
    },
  });

  await prisma.asignacionPresupuestaria.create({
    data: {
      nombramientoId: nombramiento2.id,
      categoriaPresupuestariaId: categorias[1].id,
      lineaPresupuestariaId: lineas[0].id,
      objetoGasto: '110',
      salarioBase: 4000000,
      moneda: 'PYG',
      historicoMensual: {
        '2025': {
          '12': {
            presupuestado: 4000000,
            devengado: 4000000,
            horasExtras: 0,
            bonificaciones: 200000,
            descuentos: 0,
            montoTotal: 4200000,
          },
        },
        '2026': {
          '01': {
            presupuestado: 4000000,
            devengado: 4000000,
            horasExtras: 0,
            bonificaciones: 200000,
            descuentos: 0,
            montoTotal: 4200000,
          },
        },
      },
      usuarioUltimaActualizacion: usuarios[0].email,
    },
  });

  // Nombramiento 3
  const nombramiento3 = await prisma.nombramiento.create({
    data: {
      legajoId: legajos[3].id,
      cargoId: cargos[2].id,
      tipoNombramiento: 'Encargado de Cátedra',
      categoria: 'L23',
      fechaInicio: new Date('2024-02-01'),
      fechaFin: new Date('2025-12-31'),
      resolucionId: resolucion.id,
      salarioBase: 1200000,
      moneda: 'PYG',
      vigente: false,
      estadoNombramiento: 'FINALIZADO',
      observaciones: 'Nombramiento finalizado',
    },
  });

  await prisma.asignacionPresupuestaria.create({
    data: {
      nombramientoId: nombramiento3.id,
      categoriaPresupuestariaId: categorias[2].id,
      lineaPresupuestariaId: lineas[0].id,
      objetoGasto: '110',
      salarioBase: 1200000,
      moneda: 'PYG',
      historicoMensual: {
        '2025': {
          '12': {
            presupuestado: 1200000,
            devengado: 1200000,
            horasExtras: 0,
            bonificaciones: 0,
            descuentos: 0,
            montoTotal: 1200000,
          },
        },
      },
      usuarioUltimaActualizacion: usuarios[0].email,
    },
  });

  console.log('✅ 3 nombramientos creados con sus asignaciones presupuestarias');

  // 10. Crear registros de auditoría
  console.log('📝 Creando registros de auditoría...');
  await Promise.all([
    prisma.historialCambio.create({
      data: {
        tablaAfectada: 'nombramientos',
        idRegistroAfectado: nombramiento1.id,
        campoModificado: 'salarioBase',
        valorAnterior: '2600000',
        valorNuevo: '2800000',
        usuarioModificacion: usuarios[0].email,
        motivo: 'Ajuste salarial 2026',
        ipAddress: '127.0.0.1',
      },
    }),
    prisma.historialCambio.create({
      data: {
        tablaAfectada: 'personas',
        idRegistroAfectado: personas[0].id,
        campoModificado: 'telefono',
        valorAnterior: '(059571) 206 900',
        valorNuevo: '(059571) 206 990',
        usuarioModificacion: usuarios[0].email,
        motivo: 'Actualización de datos de contacto',
        ipAddress: '127.0.0.1',
      },
    }),
  ]);
  console.log('✅ Registros de auditoría creados');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`  - ${categorias.length} categorías presupuestarias`);
  console.log(`  - ${lineas.length} líneas presupuestarias`);
  console.log(`  - ${facultades.length} facultades`);
  console.log(`  - ${cargos.length} cargos`);
  console.log(`  - ${personas.length} personas`);
  console.log(`  - ${legajos.length} legajos`);
  console.log(`  - 3 nombramientos con asignaciones`);
  console.log(`  - ${usuarios.length} usuarios`);
  console.log(`  - 2 registros de auditoría`);
  console.log('\n👤 Credenciales de acceso:');
  console.log(`  Admin: admin@unae.edu.py / Admin123!`);
  console.log(`  Usuario: usuario@unae.edu.py / Usuario123!`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
