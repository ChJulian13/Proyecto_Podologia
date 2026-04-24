import { pool } from '../../config/database.js';
import type { PacienteRow } from '../../domain/paciente/paciente.domain.js';

export class PacienteRepository {
  
  private selectQuery = `
    SELECT 
      p.*, 
      cl.nombre AS clinica_nombre 
    FROM pacientes p
    INNER JOIN clinicas cl ON p.clinica_id = cl.id
  `;

  async findAllByClinica(clinicaId: string): Promise<PacienteRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE p.clinica_id = ? AND p.esta_activo = 1 
       ORDER BY p.primer_apellido ASC, p.nombre ASC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<PacienteRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE p.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  // En create()
  async create(data: Partial<PacienteRow>): Promise<void> {
    await pool.execute(
      `INSERT INTO pacientes (
        id, clinica_id, nombre, primer_apellido, segundo_apellido, 
        telefono, correo, codigo_postal, estado, municipio, ciudad, colonia, calle_y_numero,
        fecha_nacimiento, discapacidad, alergias, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id, data.clinica_id, data.nombre, data.primer_apellido, 
        data.segundo_apellido ?? null, data.telefono, data.correo ?? null, 
        data.codigo_postal ?? null, data.estado ?? null, data.municipio ?? null, 
        data.ciudad ?? null, data.colonia ?? null, data.calle_y_numero ?? null,
        data.fecha_nacimiento ?? null, data.discapacidad ?? null, 
        data.alergias ?? null, data.notas ?? null
      ] as any[]
    );
  }

  // En update()
  async update(id: string, data: Partial<PacienteRow>): Promise<void> {
    await pool.execute(
      `UPDATE pacientes SET 
        nombre = ?, primer_apellido = ?, segundo_apellido = ?, 
        telefono = ?, correo = ?, codigo_postal = ?, estado = ?, municipio = ?, ciudad = ?, colonia = ?, calle_y_numero = ?,
        fecha_nacimiento = ?, discapacidad = ?, alergias = ?, notas = ?
       WHERE id = ?`,
      [
        data.nombre, data.primer_apellido, data.segundo_apellido ?? null, 
        data.telefono, data.correo ?? null, 
        data.codigo_postal ?? null, data.estado ?? null, data.municipio ?? null, 
        data.ciudad ?? null, data.colonia ?? null, data.calle_y_numero ?? null,
        data.fecha_nacimiento ?? null, data.discapacidad ?? null, 
        data.alergias ?? null, data.notas ?? null, 
        id
      ] as any[]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE pacientes SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }
}