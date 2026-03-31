import { pool } from '../../config/database.js'; // Ajusta la ruta a tu conexión de BD
import { type ClinicaRow } from '../../domain/clinica/clinica.domain.js';

export class ClinicaRepository {
  
  // 1. Obtener todas las clínicas ACTIVAS
  async findAllActivas(): Promise<ClinicaRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM clinicas WHERE esta_activa = 1 ORDER BY fecha_creacion DESC'
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

  // 3. Crear clínica (Recibimos el UUID generado desde el Servicio)
  async create(id: string, nombre: string, telefono: string | null, correo: string | null): Promise<void> {
    await pool.execute(
      'INSERT INTO clinicas (id, nombre, telefono, correo) VALUES (?, ?, ?, ?)',
      [id, nombre, telefono, correo]
    );
  }

  // 4. Actualizar clínica
  async update(id: string, nombre: string, telefono: string | null, correo: string | null): Promise<void> {
    await pool.execute(
      'UPDATE clinicas SET nombre = ?, telefono = ?, correo = ? WHERE id = ?',
      [nombre, telefono, correo, id]
    );
  }

  // 5. Borrado Lógico (Soft Delete)
  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE clinicas SET esta_activa = 0 WHERE id = ?',
      [id]
    );
  }
}