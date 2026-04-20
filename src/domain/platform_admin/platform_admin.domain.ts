import { z } from 'zod';

// DTO para Login de Super Admin
export const LoginSuperAdminSchema = z.object({
  correo: z.string().email("Formato de correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export type LoginSuperAdminDTO = z.infer<typeof LoginSuperAdminSchema>;

// Entidad de Base de Datos
export interface PlatformAdminRow {
  id: string;
  correo: string;
  contrasena_hash: string;
  nombre: string;
  fecha_creacion: Date;
}