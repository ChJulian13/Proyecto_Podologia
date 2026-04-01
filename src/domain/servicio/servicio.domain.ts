import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateServicioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  nombre: z.string().min(2, "El nombre del servicio es obligatorio"),
  descripcion: z.string().optional(),
  
  // Respetamos los CHECK constraints de tu base de datos
  duracion_minutos: z.number().int().positive("La duración debe ser mayor a 0").default(60),
  precio: z.number().nonnegative("El precio no puede ser negativo"),
});

export const UpdateServicioSchema = CreateServicioSchema.partial();

export type CreateServicioDTO = z.infer<typeof CreateServicioSchema>;
export type UpdateServicioDTO = z.infer<typeof UpdateServicioSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface ServicioRow {
  id: string;
  clinica_id: string;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: string; // MySQL devuelve los DECIMAL(10,2) como string
  esta_activo: number;
  fecha_creacion: Date;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA 
// ==========================================
export interface ServicioEntity {
  id: string;
  clinicaId: string;
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number; // Convertido a número para el Frontend
  estaActivo: boolean;
  fechaCreacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapServicioRowToEntity = (row: ServicioRow): ServicioEntity => {
  return {
    id: row.id,
    clinicaId: row.clinica_id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    duracionMinutos: row.duracion_minutos,
    precio: parseFloat(row.precio), // Transformación vital para el frontend
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
  };
};