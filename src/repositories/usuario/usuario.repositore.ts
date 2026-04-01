import { pool } from '../../config/database.js';
import type { UsuarioRow, RolUsuario } from '../../domain/usuario/usuario.domain.js';

export class UsuarioRepository {
  
  // 1. Buscar todos los usuarios de UNA clínica específica
  async findAllByClinica(clinicaId: string): Promise<UsuarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM usuarios WHERE clinica_id = ? AND esta_activo = 1 ORDER BY fecha_creacion DESC',
      [clinicaId]
    );
    return rows;
  }

  // 2. Buscar por ID
  async findById(id: string): Promise<UsuarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  // 3. Buscar por Correo y Clínica 
  async findByCorreoYClinica(correo: string, clinicaId: string): Promise<UsuarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM usuarios WHERE correo = ? AND clinica_id = ? LIMIT 1',
      [correo, clinicaId]
    );
    return rows[0] ?? null;
  }

  // 4. Crear usuario (Guardamos el Hash, NO la contraseña)
  async create(
    id: string, 
    clinicaId: string, 
    correo: string, 
    contrasenaHash: string, 
    nombre: string, 
    primerApellido: string, 
    segundoApellido: string | null, // Nuevo parámetro
    rol: RolUsuario
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO usuarios (id, clinica_id, correo, contrasena_hash, nombre, primer_apellido, segundo_apellido, rol) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, correo, contrasenaHash, nombre, primerApellido, segundoApellido, rol]
    );
  }

  // 5. Actualizar usuario (sin tocar la contraseña ni la clínica)
  async update(
    id: string, 
    correo: string, 
    nombre: string, 
    primerApellido: string, 
    segundoApellido: string | null, 
    rol: RolUsuario
  ): Promise<void> {
    await pool.execute(
      'UPDATE usuarios SET correo = ?, nombre = ?, primer_apellido = ?, segundo_apellido = ?, rol = ? WHERE id = ?',
      [correo, nombre, primerApellido, segundoApellido, rol, id]
    );
  }

  // 6. Borrado Lógico
  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE usuarios SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }

  // 5. Buscar usuario por correo (Para el Login)
  async findByCorreo(correo: string): Promise<UsuarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM usuarios WHERE correo = ? AND esta_activo = 1',
      [correo]
    );
    return rows;
  }
}