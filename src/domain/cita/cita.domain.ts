import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================

// El ciclo de vida de una cita
export const CitaEstado = z.enum(['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']);
export type EstadoCita = z.infer<typeof CitaEstado>;

export const CreateCitaSchema = z.object({
  clinica_id: z.string().uuid("ID de clínica inválido"),
  paciente_id: z.string().uuid("ID de paciente inválido"),
  podologo_id: z.string().uuid("ID de podólogo inválido"),
  servicio_id: z.string().uuid("ID de servicio inválido").optional().nullable(),
  
  // Expresión regular para garantizar formato YYYY-MM-DD
  fecha_programada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  
  // Expresión regular para formato de hora militar HH:MM (ej. 09:30, 14:00)
  hora_programada: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  
  duracion_minutos: z.number().int().positive().default(60), // Por defecto 1 hora
  notas: z.string().optional(),
});

// Para actualizar, hacemos todo opcional, PERO podemos cambiar el estado
export const UpdateCitaSchema = CreateCitaSchema.partial().extend({
  estado: CitaEstado.optional(),
});

export type CreateCitaDTO = z.infer<typeof CreateCitaSchema>;
export type UpdateCitaDTO = z.infer<typeof UpdateCitaSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface CitaRow {
  id: string;
  clinica_id: string;
  paciente_id: string;
  podologo_id: string;
  servicio_id: string | null;
  fecha_programada: string | Date; 
  hora_programada: string; 
  duracion_minutos: number;
  estado: EstadoCita;
  notas: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular)
// ==========================================
export interface CitaEntity {
  id: string;
  clinicaId: string;
  pacienteId: string;
  podologoId: string;
  servicioId: string | null;
  fechaProgramada: string; // Enviamos string limpio a Angular
  horaProgramada: string;  // Enviamos string limpio a Angular
  duracionMinutos: number;
  estado: EstadoCita;
  notas: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapCitaRowToEntity = (row: CitaRow): CitaEntity => {
  // MySQL a veces devuelve fechas y horas en formatos extraños dependiendo del driver,
  // aquí lo limpiamos para que el Frontend lo reciba perfecto.
  
  let fechaLimpia = '';
  if (row.fecha_programada instanceof Date) {
    fechaLimpia = row.fecha_programada.toISOString().substring(0, 10);
  } else {
    // Si ya es un string (ej. "2026-04-01T00:00:00.000Z"), lo cortamos
    fechaLimpia = typeof row.fecha_programada === 'string' 
      ? row.fecha_programada.substring(0, 10) 
      : String(row.fecha_programada);
  }

  // Si la hora viene como "14:30:00", la cortamos a "14:30" para estandarizar
  const horaLimpia = row.hora_programada.substring(0, 5);

  return {
    id: row.id,
    clinicaId: row.clinica_id,
    pacienteId: row.paciente_id,
    podologoId: row.podologo_id,
    servicioId: row.servicio_id,
    fechaProgramada: fechaLimpia,
    horaProgramada: horaLimpia,
    duracionMinutos: row.duracion_minutos,
    estado: row.estado,
    notas: row.notas,
    fechaCreacion: row.fecha_creacion,
    fechaActualizacion: row.fecha_actualizacion,
  };
};