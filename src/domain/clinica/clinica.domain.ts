// src/domain/clinica.domain.ts
import { z } from 'zod';

// ==========================================
// 1. CAPA DE VALIDACIÓN (DTOs)
// ==========================================

// Esquema Base: Define las reglas de negocio para los campos individuales
const ClinicaBaseSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  
  // Regex: Permite opcionalmente un '+' al inicio, seguido de 7 a 20 números, espacios o guiones
  telefono: z.string().regex(/^\+?[\d\s\-]{7,20}$/, "Formato de teléfono inválido").optional(),
  
  // Preprocess: Intercepta el dato antes de validarlo. Si es un string vacío, lo convierte a undefined.
  correo: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email("Formato de correo inválido").optional()
  ),
});

// DTO para Crear (Hereda todo tal cual)
export const CreateClinicaSchema = ClinicaBaseSchema;

// DTO para Actualizar (Convierte todos los campos del base a opcionales)
export const UpdateClinicaSchema = ClinicaBaseSchema.partial();

export type CreateClinicaDTO = z.infer<typeof CreateClinicaSchema>;
export type UpdateClinicaDTO = z.infer<typeof UpdateClinicaSchema>;


// ==========================================
// 2. CAPA DE INFRAESTRUCTURA / PERSISTENCIA
// ==========================================

// Refleja exactamente cómo vienen los datos crudos desde MySQL
export interface ClinicaRow {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  esta_activa: number; // MySQL tinyint(1) devuelve 0 o 1
  fecha_creacion: Date;
}


// ==========================================
// 3. CAPA DE DOMINIO PURA (Entidades)
// ==========================================

// La entidad real del negocio. Agnostica a la base de datos o librerías externas.
export interface ClinicaEntity {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  estaActiva: boolean; // El dominio trabaja con booleanos, no con números
  fechaCreacion: Date;
}


// ==========================================
// 4. MAPPERS (Transformadores)
// ==========================================

// Función vital para aislar la base de datos del resto del sistema
export const mapClinicaRowToEntity = (row: ClinicaRow): ClinicaEntity => {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    correo: row.correo,
    estaActiva: row.esta_activa === 1, // Transformación de DB a Dominio
    fechaCreacion: row.fecha_creacion,
  };
};