import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs) - Se mantiene igual
// ==========================================
export const UsuarioRol = z.enum(['ADMINISTRADOR', 'PODOLOGO', 'RECEPCIONISTA']);
export type RolUsuario = z.infer<typeof UsuarioRol>;

export const CreateUsuarioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  correo: z.string().email("Formato de correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"), 
  nombre: z.string().min(2, "El nombre es muy corto"),
  primer_apellido: z.string().min(2, "El primer apellido es obligatorio"),
  segundo_apellido: z.string().optional(),
  rol: UsuarioRol.default('RECEPCIONISTA'),
});

export const UpdateUsuarioSchema = z.object({
  correo: z.string().email("Formato de correo inválido").optional(),
  nombre: z.string().min(2).optional(),
  primer_apellido: z.string().min(2).optional(),
  segundo_apellido: z.string().optional(),
  rol: UsuarioRol.optional(),
});

export const UpdatePasswordSchema = z.object({
  contrasenaActual: z.string().min(1, "La contraseña actual es requerida"),
  nuevaContrasena: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export type CreateUsuarioDTO = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioDTO = z.infer<typeof UpdateUsuarioSchema>;
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA (MySQL)
// ==========================================
export interface UsuarioRow {
  id: string;
  clinica_id: string;
  correo: string;
  contrasena_hash: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  rol: RolUsuario;
  esta_activo: number; 
  fecha_creacion: Date;
  // Campo extraído del JOIN
  clinica_nombre?: string;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular - DTO Enriquecido)
// ==========================================
export interface UsuarioEntity {
  id: string;
  clinica: {
    id: string;
    nombre: string;
  };
  correo: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string; // Para visualización inmediata en el header o tablas
  rol: RolUsuario;
  estaActivo: boolean;
  fechaCreacion: Date;
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapUsuarioRowToEntity = (row: UsuarioRow): UsuarioEntity => {
  const nombreCompleto = [row.nombre, row.primer_apellido, row.segundo_apellido].filter(Boolean).join(' ');

  return {
    id: row.id,
    clinica: {
      id: row.clinica_id,
      nombre: row.clinica_nombre || 'Clínica Desconocida'
    },
    correo: row.correo,
    nombre: row.nombre,
    primerApellido: row.primer_apellido,
    segundoApellido: row.segundo_apellido,
    nombreCompleto: nombreCompleto,
    rol: row.rol,
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
  };
};