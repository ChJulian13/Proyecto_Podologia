import { pool } from '../../config/database.js';
import { type ClinicaRow } from '../../domain/clinica/clinica.domain.js';

export class ClinicaRepository {
  
  // 1. Obtener TODAS las clínicas (Para el panel del SuperAdmin)
  async findAll(): Promise<ClinicaRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM clinicas ORDER BY fecha_creacion DESC'
    );
    return rows;
  }

  // 2. Buscar por ID
  async findById(id: string): Promise<ClinicaRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM clinicas WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  // 3. Crear clínica SaaS
 // 3. Crear clínica SaaS
  async create(data: Partial<ClinicaRow>): Promise<void> {
    // Stringificamos el JSON si existe
    const configVisualStr = data.configuracion_visual ? JSON.stringify(data.configuracion_visual) : null;

    await pool.execute(
      `INSERT INTO clinicas (
        id, nombre, telefono, correo, 
        platform_admin_id, plan_suscripcion_id, 
        fecha_vencimiento_suscripcion, dominio_personalizado, configuracion_visual
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, 
        data.nombre, 
        data.telefono ?? null, 
        data.correo ?? null,
        data.platform_admin_id ?? null, 
        data.plan_suscripcion_id ?? null,
        data.fecha_vencimiento_suscripcion ?? null, 
        data.dominio_personalizado ?? null,
        configVisualStr
      ] as any[]
    );
  }

  // 4. Actualizar clínica SaaS
  async update(id: string, data: Partial<ClinicaRow>): Promise<void> {
    const configVisualStr = data.configuracion_visual ? JSON.stringify(data.configuracion_visual) : null;

    await pool.execute(
      `UPDATE clinicas SET 
        nombre = ?, telefono = ?, correo = ?, 
        plan_suscripcion_id = ?, fecha_vencimiento_suscripcion = ?, 
        dominio_personalizado = ?, configuracion_visual = ?, esta_activa = ?
       WHERE id = ?`,
      [
        data.nombre, 
        data.telefono ?? null, 
        data.correo ?? null,
        data.plan_suscripcion_id ?? null, 
        data.fecha_vencimiento_suscripcion ?? null,
        data.dominio_personalizado ?? null, 
        configVisualStr, 
        data.esta_activa ?? 1, // Prevenimos undefined en el estado
        id
      ] as any[] 
    );
  }

  // 5. Suspensión / Activación rápida (Toggle)
  async updateStatus(id: string, estaActiva: boolean): Promise<void> {
    await pool.execute(
      'UPDATE clinicas SET esta_activa = ? WHERE id = ?',
      [estaActiva ? 1 : 0, id]
    );
  }
}