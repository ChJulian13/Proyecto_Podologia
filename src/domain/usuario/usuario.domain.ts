import { z } from 'zod';
import { buildNombreCompleto } from '../../common/utils/name.utils.js';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================
export const UsuarioRol = z.enum(['ADMINISTRADOR', 'PODOLOGO', 'RECEPCIONISTA', 'CONTADOR']);
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
  correo: string;
  contrasena_hash: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  esta_activo: number; 
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface UsuarioClinicaRow {
  id: string;
  usuario_id: string;
  clinica_id: string;
  rol: RolUsuario;
  esta_activo: number;
  clinica_nombre?: string;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Angular - DTO Enriquecido)
// ==========================================
export interface UsuarioClinicaEntity {
  id: string;
  clinicaId: string;
  clinicaNombre?: string | undefined;
  rol: RolUsuario;
  estaActivo: boolean;
}

export interface UsuarioEntity {
  id: string;
  correo: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
  nombreCompleto: string; // Para visualización inmediata en el header o tablas
  estaActivo: boolean;
  fechaCreacion: Date;
  asignaciones: UsuarioClinicaEntity[];
}

// ==========================================
// 4. MAPPER
// ==========================================
export const mapUsuarioRowToEntity = (row: UsuarioRow, asignacionesRow: UsuarioClinicaRow[] = []): UsuarioEntity => {
  return {
    id: row.id,
    correo: row.correo,
    nombre: row.nombre,
    primerApellido: row.primer_apellido,
    segundoApellido: row.segundo_apellido,
    nombreCompleto: buildNombreCompleto(row.nombre, row.primer_apellido, row.segundo_apellido),
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
    asignaciones: asignacionesRow.map(uc => ({
      id: uc.id,
      clinicaId: uc.clinica_id,
      clinicaNombre: uc.clinica_nombre,
      rol: uc.rol,
      estaActivo: uc.esta_activo === 1
    })),
  };
};