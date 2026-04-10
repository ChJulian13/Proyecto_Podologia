import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateNotaClinicaSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  paciente_id: z.string().uuid("El ID del paciente debe ser un UUID válido"),
  podologo_id: z.string().uuid("El ID del podólogo debe ser un UUID válido"),
  cita_id: z.string().uuid("El ID de la cita debe ser un UUID válido").optional().nullable(),
  fecha_nota: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  notas: z.string().optional(),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional(),
}).refine(data => data.notas || data.diagnostico || data.tratamiento, {
  message: "Debe ingresar al menos una nota, un diagnóstico o un tratamiento",
  path: ["notas"]
});

export const UpdateNotaClinicaSchema = z.object({
  notas: z.string().optional(),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional(),
}).refine(data => data.notas || data.diagnostico || data.tratamiento, {
  message: "La nota clínica no puede quedar completamente vacía",
  path: ["notas"]
});

export type CreateNotaClinicaDTO = z.infer<typeof CreateNotaClinicaSchema>;
export type UpdateNotaClinicaDTO = z.infer<typeof UpdateNotaClinicaSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface NotaClinicaRow {
  id: string;
  clinica_id: string;
  paciente_id: string;
  cita_id: string | null;
  podologo_id: string;
  fecha_nota: string | Date;
  notas: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  fecha_creacion: Date;
  // Campos extraídos de los JOINs
  paciente_nombre?: string;
  paciente_primer_apellido?: string;
  paciente_segundo_apellido?: string;
  podologo_nombre?: string;
  podologo_primer_apellido?: string;
  podologo_segundo_apellido?: string;
  cita_fecha_programada?: string | Date;
  servicio_nombre?: string;
  clinica_nombre?: string;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular - DTO Enriquecido)
// ==========================================
export interface NotaClinicaEntity {
  id: string;
  clinica: {
    id: string;
    nombre: string;
  };
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
  cita: {
    id: string;
    fechaProgramada: string;
    servicioNombre: string;
  } | null;
  fechaNota: string;
  notas: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  fechaCreacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapNotaClinicaRowToEntity = (row: NotaClinicaRow): NotaClinicaEntity => {
  let fechaLimpia = '';
  if (row.fecha_nota instanceof Date) {
    fechaLimpia = row.fecha_nota.toISOString().substring(0, 10);
  } else {
    fechaLimpia = typeof row.fecha_nota === 'string' 
      ? row.fecha_nota.substring(0, 10) 
      : String(row.fecha_nota);
  }

  // Limpiar fecha de la cita si existe
  let citaFechaLimpia = '';
  if (row.cita_fecha_programada) {
    citaFechaLimpia = row.cita_fecha_programada instanceof Date 
      ? row.cita_fecha_programada.toISOString().substring(0, 10)
      : String(row.cita_fecha_programada).substring(0, 10);
  }

  const pacienteNombreCompleto = [row.paciente_nombre, row.paciente_primer_apellido, row.paciente_segundo_apellido].filter(Boolean).join(' ');
  const podologoNombreCompleto = [row.podologo_nombre, row.podologo_primer_apellido, row.podologo_segundo_apellido].filter(Boolean).join(' ');

  return {
    id: row.id,
    clinica: {
      id: row.clinica_id,
      nombre: row.clinica_nombre || 'Clínica Desconocida'
    },
    paciente: {
      id: row.paciente_id,
      nombre: row.paciente_nombre || 'Desconocido',
      primerApellido: row.paciente_primer_apellido || 'Desconocido',
      segundoApellido: row.paciente_segundo_apellido || null,
      nombreCompleto: pacienteNombreCompleto || 'Desconocido'
    },
    podologo: {
      id: row.podologo_id,
      nombre: row.podologo_nombre || 'Desconocido',
      primerApellido: row.podologo_primer_apellido || 'Desconocido',
      segundoApellido: row.podologo_segundo_apellido || null,
      nombreCompleto: podologoNombreCompleto || 'Desconocido'
    },
    cita: row.cita_id ? {
      id: row.cita_id,
      fechaProgramada: citaFechaLimpia,
      servicioNombre: row.servicio_nombre || 'Servicio General'
    } : null,
    fechaNota: fechaLimpia,
    notas: row.notas,
    diagnostico: row.diagnostico,
    tratamiento: row.tratamiento,
    fechaCreacion: row.fecha_creacion,
  };
};