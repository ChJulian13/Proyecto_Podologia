// ==========================================
// 1. CAPA DE INFRAESTRUCTURA (MySQL Rows)
// ==========================================
export interface ResumenHoyRow {
  totalCitasHoy: number;
  citasCompletadas: number;
  citasCanceladas: number;
  ingresosEsperadosHoy: number;
}

export interface CitaProximaRow {
  id: string;
  fecha_programada: Date;
  hora_programada: string;
  estado: string;
  nombre_paciente: string;
  nombre_podologo: string;
  nombre_servicio: string | null;
}

export interface AlertaNotaRow {
  cita_id: string;
  fecha_programada: Date;
  nombre_paciente: string;
}

// ==========================================
// 2. CAPA DE DOMINIO PURA (Angular)
// ==========================================
export interface ResumenHoyEntity {
  totalCitas: number;
  completadas: number;
  canceladas: number;
  ingresosEsperados: number;
}

export interface CitaProximaEntity {
  id: string;
  fechaProgramada: Date;
  horaProgramada: string;
  estado: string;
  nombrePaciente: string;
  nombrePodologo: string;
  nombreServicio: string | null;
}

export interface AlertaNotaEntity {
  citaId: string;
  fechaProgramada: Date;
  nombrePaciente: string;
}

// ==========================================
// 3. MAPPERS
// ==========================================
export const mapResumenToEntity = (row: ResumenHoyRow): ResumenHoyEntity => ({
  totalCitas: Number(row.totalCitasHoy),
  completadas: Number(row.citasCompletadas),
  canceladas: Number(row.citasCanceladas),
  ingresosEsperados: Number(row.ingresosEsperadosHoy),
});

export const mapCitaProximaRowToEntity = (row: CitaProximaRow): CitaProximaEntity => ({
  id: row.id,
  fechaProgramada: row.fecha_programada,
  horaProgramada: row.hora_programada,
  estado: row.estado,
  nombrePaciente: row.nombre_paciente,
  nombrePodologo: row.nombre_podologo,
  nombreServicio: row.nombre_servicio,
});

export const mapAlertaNotaToEntity = (row: AlertaNotaRow): AlertaNotaEntity => ({
  citaId: row.cita_id,
  fechaProgramada: row.fecha_programada,
  nombrePaciente: row.nombre_paciente,
});

export interface IngresoRow {
  fecha_emision: Date | string;
  totalPagado: number;
  totalPendiente: number;
}

export interface ServicioPopularRow {
  nombre_servicio: string;
  cantidad_realizada: number;
}

export interface TasaAsistenciaRow {
  estado: string;
  cantidad: number;
}

// --- NUEVAS INTERFACES DE DOMINIO (Finanzas) ---
export interface IngresoEntity {
  fechaEmision: string;
  totalPagado: number;
  totalPendiente: number;
}

export interface ServicioPopularEntity {
  nombreServicio: string;
  cantidadRealizada: number;
}

export interface TasaAsistenciaEntity {
  estado: string;
  cantidad: number;
}

// --- NUEVOS MAPPERS ---
export const mapIngresoToEntity = (row: IngresoRow): IngresoEntity => {
  // Aseguramos formato YYYY-MM-DD para el frontend
  const fechaStr = row.fecha_emision instanceof Date 
    ? row.fecha_emision.toISOString().substring(0, 10) 
    : String(row.fecha_emision).substring(0, 10);

  return {
    fechaEmision: fechaStr,
    totalPagado: Number(row.totalPagado),
    totalPendiente: Number(row.totalPendiente)
  };
};

export const mapServicioPopularToEntity = (row: ServicioPopularRow): ServicioPopularEntity => ({
  nombreServicio: row.nombre_servicio,
  cantidadRealizada: Number(row.cantidad_realizada)
});

export const mapTasaAsistenciaToEntity = (row: TasaAsistenciaRow): TasaAsistenciaEntity => ({
  estado: row.estado,
  cantidad: Number(row.cantidad)
});