import { pool } from '../../config/database.js';
import type { UsuarioRow, UsuarioClinicaRow, RolUsuario } from '../../domain/usuario/usuario.domain.js';

export class UsuarioRepository {
  
  async findAllByClinica(clinicaId: string): Promise<UsuarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT u.* 
       FROM usuarios u
       INNER JOIN usuarios_clinicas uc ON uc.usuario_id = u.id
       WHERE uc.clinica_id = ? AND u.esta_activo = 1 AND uc.esta_activo = 1
       ORDER BY u.fecha_creacion DESC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<UsuarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM usuarios WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByCorreo(correo: string): Promise<UsuarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM usuarios WHERE correo = ? AND esta_activo = 1 LIMIT 1`,
      [correo]
    );
    return rows[0] ?? null;
  }

  async findAsignaciones(usuarioId: string): Promise<UsuarioClinicaRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT uc.*, c.nombre as clinica_nombre 
       FROM usuarios_clinicas uc
       INNER JOIN clinicas c ON uc.clinica_id = c.id
       WHERE uc.usuario_id = ? AND uc.esta_activo = 1 AND c.esta_activa = 1`,
      [usuarioId]
    );
    return rows;
  }

  // Create now needs a connection for transactions
  async createWithTransaction(
    connection: any,
    id: string, correo: string, contrasenaHash: string, 
    nombre: string, primerApellido: string, segundoApellido: string | null
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO usuarios (id, correo, contrasena_hash, nombre, primer_apellido, segundo_apellido) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, correo, contrasenaHash, nombre, primerApellido, segundoApellido]
    );
  }

  async assignClinicaWithTransaction(
    connection: any,
    id: string, usuarioId: string, clinicaId: string, rol: RolUsuario
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO usuarios_clinicas (id, usuario_id, clinica_id, rol) 
       VALUES (?, ?, ?, ?)`,
      [id, usuarioId, clinicaId, rol]
    );
  }

  async update(
    id: string, correo: string, nombre: string, primerApellido: string, 
    segundoApellido: string | null
  ): Promise<void> {
    await pool.execute(
      'UPDATE usuarios SET correo = ?, nombre = ?, primer_apellido = ?, segundo_apellido = ? WHERE id = ?',
      [correo, nombre, primerApellido, segundoApellido, id]
    );
  }

  async updateRolClinica(usuarioId: string, clinicaId: string, rol: RolUsuario): Promise<void> {
    await pool.execute(
      'UPDATE usuarios_clinicas SET rol = ? WHERE usuario_id = ? AND clinica_id = ?',
      [rol, usuarioId, clinicaId]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute('UPDATE usuarios SET esta_activo = 0 WHERE id = ?', [id]);
  }

  async softDeleteAsignacion(usuarioId: string, clinicaId: string): Promise<void> {
    await pool.execute('UPDATE usuarios_clinicas SET esta_activo = 0 WHERE usuario_id = ? AND clinica_id = ?', [usuarioId, clinicaId]);
  }

  async updatePassword(id: string, contrasenaHash: string): Promise<void> {
    await pool.execute(
      'UPDATE usuarios SET contrasena_hash = ? WHERE id = ?',
      [contrasenaHash, id]
    );
  }
}