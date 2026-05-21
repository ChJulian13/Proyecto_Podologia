import { pool } from '../../config/database.js';
import type { CategoriaInventarioRow } from '../../domain/categoria_inventario/categoria_inventario.domain.js';

export class CategoriaInventarioRepository {

  async findAll(clinicaId: string): Promise<CategoriaInventarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM categorias_inventario WHERE esta_activo = 1 AND (clinica_id = ? OR clinica_id IS NULL) ORDER BY nombre ASC',
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<CategoriaInventarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM categorias_inventario WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  async findByNombre(nombre: string, clinicaId: string): Promise<CategoriaInventarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM categorias_inventario WHERE nombre = ? AND (clinica_id = ? OR clinica_id IS NULL) LIMIT 1',
      [nombre, clinicaId]
    );
    return rows[0] ?? null;
  }

  async create(id: string, clinicaId: string | null, nombre: string, descripcion: string | null): Promise<void> {
    await pool.execute(
      'INSERT INTO categorias_inventario (id, clinica_id, nombre, descripcion) VALUES (?, ?, ?, ?)',
      [id, clinicaId, nombre, descripcion]
    );
  }

  async update(id: string, nombre: string, descripcion: string | null): Promise<void> {
    await pool.execute(
      'UPDATE categorias_inventario SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion, id]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE categorias_inventario SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }

  async countProductosByCategoria(categoriaId: string): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      'SELECT COUNT(*) AS total FROM inventario WHERE categoria_id = ? AND esta_activo = 1',
      [categoriaId]
    );
    return rows[0].total;
  }
}
