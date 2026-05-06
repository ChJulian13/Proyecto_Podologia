import { pool } from '../../config/database.js';
import type { PoolConnection } from 'mysql2/promise';
import type { InventarioRow } from '../../domain/inventario/inventario.domain.js';

export class InventarioRepository {

  // Base query con JOIN para traer el nombre de la categoría
  private selectQuery = `
    SELECT 
      i.*, 
      ci.nombre AS categoria_nombre 
    FROM inventario i
    INNER JOIN categorias_inventario ci ON i.categoria_id = ci.id
  `;

  async findAllByClinica(clinicaId: string): Promise<InventarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE i.clinica_id = ? AND i.esta_activo = 1 
       ORDER BY i.nombre ASC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<InventarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE i.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async create(
    id: string, clinicaId: string, categoriaId: string, nombre: string,
    descripcion: string | null, stockCantidad: number, precioCompra: number | null,
    precioVenta: number | null, fechaCaducidad: string | null, ubicacion: string | null
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO inventario 
       (id, clinica_id, categoria_id, nombre, descripcion, stock_cantidad, precio_compra, precio_venta, fecha_caducidad, ubicacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, categoriaId, nombre, descripcion, stockCantidad, precioCompra, precioVenta, fechaCaducidad, ubicacion]
    );
  }

  async update(id: string, data: Record<string, any>): Promise<void> {
    const allowedFields = [
      'categoria_id', 'nombre', 'descripcion', 'precio_compra',
      'precio_venta', 'fecha_caducidad', 'ubicacion'
    ];

    const fields: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field] ?? null);
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE inventario SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async updateStock(id: string, nuevaCantidad: number): Promise<void> {
    await pool.execute(
      'UPDATE inventario SET stock_cantidad = ? WHERE id = ?',
      [nuevaCantidad, id]
    );
  }

  async updateStockWithTransaction(connection: PoolConnection, id: string, nuevaCantidad: number): Promise<void> {
    await connection.execute(
      'UPDATE inventario SET stock_cantidad = ? WHERE id = ?',
      [nuevaCantidad, id]
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE inventario SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }
}
