// ==========================================
// 1. CAPA DE INFRAESTRUCTURA (MySQL Views)
// ==========================================
export interface CitaHoyRow {
  id: string;
  hora_programada: string;
  estado: string;
  nombre_paciente: string;
  telefono_paciente: string;
  nombre_podologo: string;
  nombre_servicio: string | null;
  notas: string | null;
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

// ==========================================
// 2. CAPA DE DOMINIO PURA (Angular)
// ==========================================
export interface CitaHoyEntity {
  id: string;
  horaProgramada: string;
  estado: string;
  nombrePaciente: string;
  telefonoPaciente: string;
  nombrePodologo: string;
  nombreServicio: string | null;
  notas: string | null;
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

// ==========================================
// 3. MAPPERS
// ==========================================
export const mapCitaHoyRowToEntity = (row: CitaHoyRow): CitaHoyEntity => ({
  id: row.id,
  horaProgramada: row.hora_programada,
  estado: row.estado,
  nombrePaciente: row.nombre_paciente,
  telefonoPaciente: row.telefono_paciente,
  nombrePodologo: row.nombre_podologo,
  nombreServicio: row.nombre_servicio,
  notas: row.notas,
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