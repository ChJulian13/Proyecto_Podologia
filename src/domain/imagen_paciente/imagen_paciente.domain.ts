import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateImagenSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  paciente_id: z.string().uuid("El ID del paciente debe ser un UUID válido"),
  // Puede estar ligada a una nota específica o solo al paciente general
  nota_clinica_id: z.string().uuid("El ID de la nota debe ser un UUID válido").optional().nullable(),
  descripcion: z.string().optional(),
  // Nota: url_archivo no viene en este esquema porque la genera el backend al guardar el archivo físico
});

export type CreateImagenDTO = z.infer<typeof CreateImagenSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface ImagenPacienteRow {
  id: string;
  clinica_id: string;
  paciente_id: string;
  nota_clinica_id: string | null;
  url_archivo: string;
  descripcion: string | null;
  fecha_creacion: Date;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular)
// ==========================================
export interface ImagenPacienteEntity {
  id: string;
  clinicaId: string;
  pacienteId: string;
  notaClinicaId: string | null;
  urlArchivo: string;
  descripcion: string | null;
  fechaCreacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapImagenRowToEntity = (row: ImagenPacienteRow): ImagenPacienteEntity => {
  return {
    id: row.id,
    clinicaId: row.clinica_id,
    pacienteId: row.paciente_id,
    notaClinicaId: row.nota_clinica_id,
    urlArchivo: row.url_archivo,
    descripcion: row.descripcion,
    fechaCreacion: row.fecha_creacion,
  };
};