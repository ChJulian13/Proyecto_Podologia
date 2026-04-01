import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================

// Enum estricto de Zod para los roles 
export const UsuarioRol = z.enum(['ADMINISTRADOR', 'PODOLOGO', 'RECEPCIONISTA']);
export type RolUsuario = z.infer<typeof UsuarioRol>;

// DTO para Creación (Registro de empleado)
export const CreateUsuarioSchema = z.object({
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido"),
  correo: z.string().email("Formato de correo inválido"),
  // Pedimos la contraseña en texto plano, el Servicio se encargará de encriptarla
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"), 
  nombre: z.string().min(2, "El nombre es muy corto"),
  primer_apellido: z.string().min(2, "El primer apellido es obligatorio"),
  segundo_apellido: z.string().optional(), // Es opcional
  rol: UsuarioRol.default('RECEPCIONISTA'),
});

// DTO para Actualización 
// Nota: Por seguridad, la contraseña y la clínica no se suelen actualizar por este endpoint general
export const UpdateUsuarioSchema = z.object({
  correo: z.string().email("Formato de correo inválido").optional(),
  nombre: z.string().min(2).optional(),
  primer_apellido: z.string().min(2).optional(),
  segundo_apellido: z.string().optional(),
  rol: UsuarioRol.optional(),
});

export type CreateUsuarioDTO = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioDTO = z.infer<typeof UpdateUsuarioSchema>;


// ==========================================
// 2. CAPA DE INFRAESTRUCTURA / PERSISTENCIA
// ==========================================

// Fila cruda como la escupe MySQL
export interface UsuarioRow {
  id: string;
  clinica_id: string;
  correo: string;
  contrasena_hash: string; // Dato súper sensible
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  rol: RolUsuario;
  esta_activo: number; 
  fecha_creacion: Date;
}


// ==========================================
// 3. CAPA DE DOMINIO PURA (Entidades)
// ==========================================

// La entidad que viaja por la app 
export interface UsuarioEntity {
  id: string;
  clinicaId: string; // Convertimos snake_case a camelCase para JS/TS
  correo: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
  rol: RolUsuario;
  estaActivo: boolean;
  fechaCreacion: Date;
}


// ==========================================
// 4. MAPPERS (Transformadores)
// ==========================================

export const mapUsuarioRowToEntity = (row: UsuarioRow): UsuarioEntity => {
  return {
    id: row.id,
    clinicaId: row.clinica_id,
    correo: row.correo,
    nombre: row.nombre,
    primerApellido: row.primer_apellido,
    segundoApellido: row.segundo_apellido,
    rol: row.rol,
    estaActivo: row.esta_activo === 1,
    fechaCreacion: row.fecha_creacion,
  };
};