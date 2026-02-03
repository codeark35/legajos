export interface DatosMes {
  presupuestado: number;
  devengado: number;
  aportesPatronales?: number;
  aportesPersonales?: number;
  observaciones?: string;
  fechaRegistro?: string;
}

export interface MesEdicion {
  anio: number;
  mes: number;
  datos: DatosMes;
}
