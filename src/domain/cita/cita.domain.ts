import { z } from 'zod';
import { toDateString } from '../../common/utils/date.utils.js';
import { buildNombreCompleto } from '../../common/utils/name.utils.js';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CitaEstado = z.enum(['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']);
export type EstadoCita = z.infer<typeof CitaEstado>;

export const CreateCitaSchema = z.object({
  clinica_id: z.string().uuid("ID de clínica inválido"),
  paciente_id: z.string().uuid("ID de paciente inválido"),
  podologo_id: z.string().uuid("ID de podólogo inválido"),
  servicio_id: z.string().uuid("ID de servicio inválido").optional().nullable(),
  fecha_programada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  hora_programada: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  duracion_minutos: z.number().int().positive().default(60),
  notas: z.string().optional(),
});

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
  // Campos extraídos del JOIN
  paciente_nombre?: string;
  paciente_primer_apellido?: string;
  paciente_segundo_apellido?: string;
  servicio_nombre?: string;
  podologo_nombre?: string;
  podologo_primer_apellido?: string;
  podologo_segundo_apellido?: string;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular - DTO Enriquecido)
// ==========================================
export interface CitaEntity {
  id: string;
  clinicaId: string;
  paciente: {
    id: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string | null;
    nombreCompleto: string; 
  };
  podologo: {
    id: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string | null;
    nombreCompleto: string;
  };
  servicio: {
    id: string;
    nombre: string;
  } | null;
  fechaProgramada: string; 
  horaProgramada: string;  
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
  return {
    id: row.id,
    clinicaId: row.clinica_id,
    paciente: {
      id: row.paciente_id,
      nombre: row.paciente_nombre || 'Desconocido',
      primerApellido: row.paciente_primer_apellido || 'Desconocido',
      segundoApellido: row.paciente_segundo_apellido || null,
      nombreCompleto: buildNombreCompleto(row.paciente_nombre, row.paciente_primer_apellido, row.paciente_segundo_apellido)
    },
    podologo: {
      id: row.podologo_id,
      nombre: row.podologo_nombre || 'Desconocido',
      primerApellido: row.podologo_primer_apellido || 'Desconocido',
      segundoApellido: row.podologo_segundo_apellido || null,
      nombreCompleto: buildNombreCompleto(row.podologo_nombre, row.podologo_primer_apellido, row.podologo_segundo_apellido)
    },
    servicio: row.servicio_id ? {
      id: row.servicio_id,
      nombre: row.servicio_nombre || 'Desconocido'
    } : null,
    fechaProgramada: toDateString(row.fecha_programada),
    horaProgramada: row.hora_programada.substring(0, 5),
    duracionMinutos: row.duracion_minutos,
    estado: row.estado,
    notas: row.notas,
    fechaCreacion: row.fecha_creacion,
    fechaActualizacion: row.fecha_actualizacion,
  };
};