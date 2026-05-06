import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const CreateCategoriaInventarioSchema = z.object({
  nombre: z.string().min(2, "El nombre de la categoría es obligatorio (mínimo 2 caracteres)").max(50),
  descripcion: z.string().max(255).optional().nullable(),
});

export const UpdateCategoriaInventarioSchema = CreateCategoriaInventarioSchema.partial();

export type CreateCategoriaInventarioDTO = z.infer<typeof CreateCategoriaInventarioSchema>;
export type UpdateCategoriaInventarioDTO = z.infer<typeof UpdateCategoriaInventarioSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface CategoriaInventarioRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  esta_activo: number;
  fecha_creacion: Date;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Entity para Angular)
// ==========================================
export interface CategoriaInventarioEntity {
  id: string;
  nombre: string;
  descripcion: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapCategoriaInventarioRowToEntity = (row: CategoriaInventarioRow): CategoriaInventarioEntity => ({
  id: row.id,
  nombre: row.nombre,
  descripcion: row.descripcion,
  estaActivo: row.esta_activo === 1,
  fechaCreacion: row.fecha_creacion,
});
