import { z } from 'zod';

export const LoginSchema = z.object({
  correo: z.string().email("Formato de correo inválido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
  clinica_id: z.string().uuid("El ID de la clínica debe ser un UUID válido").optional(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;