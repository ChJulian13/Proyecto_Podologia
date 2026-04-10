import { pool } from '../../config/database.js';
import type { UsuarioRow, RolUsuario } from '../../domain/usuario/usuario.domain.js';

export class UsuarioRepository {
  
  // Base query para centralizar el enriquecimiento de datos
  private selectQuery = `
    SELECT 
      u.*, 
      cl.nombre AS clinica_nombre 
    FROM usuarios u
    INNER JOIN clinicas cl ON u.clinica_id = cl.id
  `;

  async findAllByClinica(clinicaId: string): Promise<UsuarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE u.clinica_id = ? AND u.esta_activo = 1 
       ORDER BY u.fecha_creacion DESC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<UsuarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByCorreoYClinica(correo: string, clinicaId: string): Promise<UsuarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE u.correo = ? AND u.clinica_id = ? LIMIT 1`,
      [correo, clinicaId]
    );
    return rows[0] ?? null;
  }

  async findByCorreo(correo: string): Promise<UsuarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE u.correo = ? AND u.esta_activo = 1`,
      [correo]
    );
    return rows;
  }

  // Los métodos de escritura (create, update, softDelete) no necesitan JOIN y se mantienen igual
  async create(
    id: string, clinicaId: string, correo: string, contrasenaHash: string, 
    nombre: string, primerApellido: string, segundoApellido: string | null, rol: RolUsuario
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO usuarios (id, clinica_id, correo, contrasena_hash, nombre, primer_apellido, segundo_apellido, rol) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, correo, contrasenaHash, nombre, primerApellido, segundoApellido, rol]
    );
  }

  async update(
    id: string, correo: string, nombre: string, primerApellido: string, 
    segundoApellido: string | null, rol: RolUsuario
  ): Promise<void> {
    await pool.execute(
      'UPDATE usuarios SET correo = ?, nombre = ?, primer_apellido = ?, segundo_apellido = ?, rol = ? WHERE id = ?',
      [correo, nombre, primerApellido, segundoApellido, rol, id]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute('UPDATE usuarios SET esta_activo = 0 WHERE id = ?', [id]);
  }
}