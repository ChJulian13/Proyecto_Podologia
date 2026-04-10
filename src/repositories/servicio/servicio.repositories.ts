import { pool } from '../../config/database.js';
import type { ServicioRow } from '../../domain/servicio/servicio.domain.js';

export class ServicioRepository {
  
  // Base query para enriquecer el servicio con el nombre de su clínica
  private selectQuery = `
    SELECT 
      s.*, 
      cl.nombre AS clinica_nombre 
    FROM servicios s
    INNER JOIN clinicas cl ON s.clinica_id = cl.id
  `;

  async findAllByClinica(clinicaId: string): Promise<ServicioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE s.clinica_id = ? AND s.esta_activo = 1 
       ORDER BY s.nombre ASC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<ServicioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE s.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async create(
    id: string, clinicaId: string, nombre: string, descripcion: string | null, 
    duracionMinutos: number, precio: number
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO servicios (id, clinica_id, nombre, descripcion, duracion_minutos, precio) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, nombre, descripcion, duracionMinutos, precio]
    );
  }

  async update(
    id: string, nombre: string, descripcion: string | null, 
    duracionMinutos: number, precio: number
  ): Promise<void> {
    await pool.execute(
      `UPDATE servicios SET nombre = ?, descripcion = ?, duracion_minutos = ?, precio = ? 
       WHERE id = ?`,
      [nombre, descripcion, duracionMinutos, precio, id]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE servicios SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }
}