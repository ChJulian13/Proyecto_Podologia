import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs) (Se queda igual)
// ==========================================
export const CreateServicioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  nombre: z.string().min(2, "El nombre del servicio es obligatorio"),
  descripcion: z.string().optional(),
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
  // Campo extraído del JOIN
  clinica_nombre?: string;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular - DTO Enriquecido)
// ==========================================
export interface ServicioEntity {
  id: string;
  clinica: {
    id: string;
    nombre: string;
  };
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number; 
  estaActivo: boolean;
  fechaCreacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapServicioRowToEntity = (row: ServicioRow): ServicioEntity => {
  return {
    id: row.id,
    clinica: {
      id: row.clinica_id,
      nombre: row.clinica_nombre || 'Clínica Desconocida'
    },
    nombre: row.nombre,
    descripcion: row.descripcion,
    duracionMinutos: row.duracion_minutos,
    precio: parseFloat(row.precio), 
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
  };
};