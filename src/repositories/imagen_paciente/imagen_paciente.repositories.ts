import { pool } from '../../config/database.js';
import type { ImagenPacienteRow } from '../../domain/imagen_paciente/imagen_paciente.domain.js';

export class ImagenPacienteRepository {
  
  async findByPacienteId(pacienteId: string): Promise<ImagenPacienteRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM imagenes_paciente 
       WHERE paciente_id = ? 
       ORDER BY fecha_creacion DESC`,
      [pacienteId]
    );
    return rows;
  }

  async findById(id: string): Promise<ImagenPacienteRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM imagenes_paciente WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  async create(
    id: string, clinicaId: string, pacienteId: string, 
    notaClinicaId: string | null, urlArchivo: string, descripcion: string | null
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO imagenes_paciente 
       (id, clinica_id, paciente_id, nota_clinica_id, url_archivo, descripcion) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, pacienteId, notaClinicaId, urlArchivo, descripcion]
    );
  }

  async delete(id: string): Promise<void> {
    await pool.execute(
      'DELETE FROM imagenes_paciente WHERE id = ?',
      [id]
    );
  }

  async findByNotaClinicaId(notaClinicaId: string): Promise<ImagenPacienteRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM imagenes_paciente 
       WHERE nota_clinica_id = ? 
       ORDER BY fecha_creacion DESC`,
      [notaClinicaId]
    );
    return rows;
  }
}