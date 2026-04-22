import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================

const ClinicaBaseSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  
  telefono: z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Formato de teléfono inválido").optional(),
  
  correo: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email("Formato de correo inválido").optional()
  ),

  // NUEVOS CAMPOS SaaS
  platformAdminId: z.string().uuid("Formato de ID de administrador inválido").optional(),
  
  planSuscripcionId: z.string().uuid("Debe seleccionar un plan de suscripción válido"),
  
  // YYYY-MM-DD
  fechaVencimientoSuscripcion: z.string().optional(), 
  
  // Regex: Solo letras minúsculas, números y guiones (ideal para subdominios)
  dominioPersonalizado: z.string()
    .min(3, "El dominio debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "El dominio solo puede contener letras minúsculas, números y guiones")
    .optional(),
    
  // Acepta cualquier objeto JSON para la configuración visual
  configuracionVisual: z.record(z.string(), z.any()).optional(),

  codigoPostal: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos").optional(),
  estado: z.string().optional(),
  municipio: z.string().optional(),
  ciudad: z.string().optional(),
  colonia: z.string().optional(),
  calleYNumero: z.string().optional()
});

// DTO para Crear
export const CreateClinicaSchema = ClinicaBaseSchema;

// DTO para Actualizar (Hacemos todos los campos opcionales)
export const UpdateClinicaSchema = ClinicaBaseSchema.partial();

export type CreateClinicaDTO = z.infer<typeof CreateClinicaSchema>;
export type UpdateClinicaDTO = z.infer<typeof UpdateClinicaSchema>;

// ==========================================
// 2. CAPA DE INFRAESTRUCTURA / PERSISTENCIA
// ==========================================

export interface ClinicaRow {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  esta_activa: number; 
  fecha_creacion: Date;
  
  // NUEVOS CAMPOS SaaS (Mapeo directo de MySQL)
  platform_admin_id: string | null;
  plan_suscripcion_id: string | null;
  fecha_vencimiento_suscripcion: Date | string | null;
  dominio_personalizado: string | null;
  configuracion_visual: any | null; 
  codigo_postal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calle_y_numero: string | null;
}

// ==========================================
// 3. CAPA DE DOMINIO PURA (Entidades)
// ==========================================

export interface ClinicaEntity {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  estaActiva: boolean; 
  fechaCreacion: Date;
  
  // NUEVOS CAMPOS SaaS (CamelCase)
  platformAdminId: string | null;
  planSuscripcionId: string | null;
  fechaVencimientoSuscripcion: Date | string | null;
  dominioPersonalizado: string | null;
  configuracionVisual: any | null;

  codigoPostal: string | null;
  estado: string | null;
  municipio: string | null;
  ciudad: string | null;
  colonia: string | null;
  calleYNumero: string | null;
}

// ==========================================
// 4. MAPPERS (Transformadores)
// ==========================================

export const mapClinicaRowToEntity = (row: ClinicaRow): ClinicaEntity => {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    correo: row.correo,
    estaActiva: row.esta_activa === 1, 
    fechaCreacion: row.fecha_creacion,
    
    // Mapeo SaaS
    platformAdminId: row.platform_admin_id,
    planSuscripcionId: row.plan_suscripcion_id,
    fechaVencimientoSuscripcion: row.fecha_vencimiento_suscripcion,
    dominioPersonalizado: row.dominio_personalizado,
    configuracionVisual: row.configuracion_visual,
    codigoPostal: row.codigo_postal,
    estado: row.estado,
    municipio: row.municipio,
    ciudad: row.ciudad,
    colonia: row.colonia,
    calleYNumero: row.calle_y_numero
  };
};