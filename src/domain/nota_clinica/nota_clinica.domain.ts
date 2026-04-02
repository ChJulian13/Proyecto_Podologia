import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateNotaClinicaSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  paciente_id: z.string().uuid("El ID del paciente debe ser un UUID válido"),
  podologo_id: z.string().uuid("El ID del podólogo debe ser un UUID válido"),
  
  // cita_id es opcional, permitiendo notas sin cita previa
  cita_id: z.string().uuid("El ID de la cita debe ser un UUID válido").optional().nullable(),
  
  // Si no se envía fecha, la base de datos pondrá CURDATE() por defecto
  fecha_nota: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  
  notas: z.string().optional(),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional(),
}).refine(data => data.notas || data.diagnostico || data.tratamiento, {
  message: "Debe ingresar al menos una nota, un diagnóstico o un tratamiento",
  path: ["notas"] // El error se mostrará apuntando a este campo
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
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular)
// ==========================================
export interface NotaClinicaEntity {
  id: string;
  clinicaId: string;
  pacienteId: string;
  citaId: string | null;
  podologoId: string;
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

  return {
    id: row.id,
    clinicaId: row.clinica_id,
    pacienteId: row.paciente_id,
    citaId: row.cita_id,
    podologoId: row.podologo_id,
    fechaNota: fechaLimpia,
    notas: row.notas,
    diagnostico: row.diagnostico,
    tratamiento: row.tratamiento,
    fechaCreacion: row.fecha_creacion,
  };
};