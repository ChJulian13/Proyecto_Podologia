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

  async create(
    id: string, clinicaId: string, nombre: string, primerApellido: string, segundoApellido: string | null,
    telefono: string, correo: string | null, fechaNacimiento: string | null,
    direccion: string | null, discapacidad: string | null, alergias: string | null, notas: string | null
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO pacientes 
      (id, clinica_id, nombre, primer_apellido, segundo_apellido, telefono, correo, fecha_nacimiento, direccion, discapacidad, alergias, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, nombre, primerApellido, segundoApellido, telefono, correo, fechaNacimiento, direccion, discapacidad, alergias, notas]
    );
  }

  async update(
    id: string, nombre: string, primerApellido: string, segundoApellido: string | null,
    telefono: string, correo: string | null, fechaNacimiento: string | null,
    direccion: string | null, discapacidad: string | null, alergias: string | null, notas: string | null
  ): Promise<void> {
    await pool.execute(
      `UPDATE pacientes 
       SET nombre = ?, primer_apellido = ?, segundo_apellido = ?, telefono = ?, correo = ?, 
           fecha_nacimiento = ?, direccion = ?, discapacidad = ?, alergias = ?, notas = ? 
       WHERE id = ?`,
      [nombre, primerApellido, segundoApellido, telefono, correo, fechaNacimiento, direccion, discapacidad, alergias, notas, id]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE pacientes SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }
}