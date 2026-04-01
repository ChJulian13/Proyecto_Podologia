import { pool } from '../../config/database.js';
import type { ServicioRow } from '../../domain/servicio/servicio.domain.js';

export class ServicioRepository {
  
  async findAllByClinica(clinicaId: string): Promise<ServicioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM servicios 
       WHERE clinica_id = ? AND esta_activo = 1 
       ORDER BY nombre ASC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<ServicioRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM servicios WHERE id = ? LIMIT 1',
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