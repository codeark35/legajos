export interface MesData {
  presupuestado: number;
  devengado: number;
  aporteJubilatorio?: number;
  aportesPersonales?: number;
  lineaPresupuestariaId: string;
  codigoLinea?: string;
  descripcionLinea?: string;
  categoriaPresupuestariaId: string;
  codigoCategoria?: string;
  descripcionCategoria?: string;
  objetoGasto?: string;
  observaciones?: string;
  fechaRegistro: string;
  usuarioRegistro?: string;
}

export interface HistoricoMensual {
  [anio: string]: {
    [mes: string]: MesData;
  };
}
