import { pool } from '../../config/database.js';
import type { PoolConnection } from 'mysql2/promise';
import type {
  InventarioRow,
  InventarioLoteRow,
  InventarioCodigoBarrasRow,
} from '../../domain/inventario/inventario.domain.js';

export class InventarioRepository {

  // Base query con JOIN categoría + SUM stock de lotes
  private selectQuery = `
    SELECT 
      i.id, i.clinica_id, i.categoria_id, i.nombre, i.descripcion,
      i.precio_compra, i.precio_venta, i.requiere_lote, i.requiere_caducidad,
      i.ubicacion, i.esta_activo, i.fecha_creacion, i.fecha_actualizacion,
      ci.nombre AS categoria_nombre,
      COALESCE(SUM(il.stock_cantidad), 0) AS stock_total
    FROM inventario i
    INNER JOIN categorias_inventario ci ON i.categoria_id = ci.id
    LEFT JOIN inventario_lotes il ON i.id = il.inventario_id
  `;

  private groupBy = `GROUP BY i.id`;

  // ────────────────────────────────────────────────────────────────────────
  // INVENTARIO — Lectura
  // ────────────────────────────────────────────────────────────────────────

  async findAllByClinica(clinicaId: string): Promise<InventarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE i.clinica_id = ? AND i.esta_activo = 1 
       ${this.groupBy}
       ORDER BY i.nombre ASC`,
      [clinicaId]
    );
    return rows;
  }

  async findProductosVentaByClinica(clinicaId: string): Promise<InventarioRow[]> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} 
       WHERE i.clinica_id = ? AND i.esta_activo = 1 AND ci.nombre = 'Producto de Venta'
       ${this.groupBy}
       ORDER BY i.nombre ASC`,
      [clinicaId]
    );
    return rows;
  }

  async findById(id: string): Promise<InventarioRow | null> {
    const [rows] = await pool.execute<any[]>(
      `${this.selectQuery} WHERE i.id = ? ${this.groupBy} LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  // ────────────────────────────────────────────────────────────────────────
  // INVENTARIO — Escritura
  // ────────────────────────────────────────────────────────────────────────

  async create(
    id: string, clinicaId: string, categoriaId: string, nombre: string,
    descripcion: string | null, precioCompra: number | null,
    precioVenta: number | null, requiereLote: boolean, requiereCaducidad: boolean,
    ubicacion: string | null
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO inventario 
       (id, clinica_id, categoria_id, nombre, descripcion, precio_compra, precio_venta, requiere_lote, requiere_caducidad, ubicacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicaId, categoriaId, nombre, descripcion, precioCompra, precioVenta, requiereLote ? 1 : 0, requiereCaducidad ? 1 : 0, ubicacion]
    );
  }

  async update(id: string, data: Record<string, any>): Promise<void> {
    const allowedFields = [
      'categoria_id', 'nombre', 'descripcion', 'precio_compra',
      'precio_venta', 'requiere_lote', 'requiere_caducidad', 'ubicacion'
    ];

    const booleanFields = new Set(['requiere_lote', 'requiere_caducidad']);

    const fields: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        const val = data[field];
        values.push(booleanFields.has(field) ? (val ? 1 : 0) : (val ?? null));
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE inventario SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async softDelete(id: string): Promise<void> {
    await pool.execute(
      'UPDATE inventario SET esta_activo = 0 WHERE id = ?',
      [id]
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // LOTES — CRUD
  // ────────────────────────────────────────────────────────────────────────

  async createLote(
    id: string, inventarioId: string, numeroLote: string,
    fechaCaducidad: string | null, stockCantidad: number
  ): Promise<void> {
    await pool.execute(
      `INSERT INTO inventario_lotes (id, inventario_id, numero_lote, fecha_caducidad, stock_cantidad) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, inventarioId, numeroLote, fechaCaducidad, stockCantidad]
    );
  }

  async findLotesByInventarioId(inventarioId: string): Promise<InventarioLoteRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM inventario_lotes 
       WHERE inventario_id = ? 
       ORDER BY fecha_caducidad ASC, fecha_ingreso ASC`,
      [inventarioId]
    );
    return rows;
  }

  /** Lotes con stock > 0, ordenados FEFO (First Expired, First Out) */
  async findLotesDisponiblesFefo(inventarioId: string): Promise<InventarioLoteRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM inventario_lotes 
       WHERE inventario_id = ? AND stock_cantidad > 0 
       ORDER BY fecha_caducidad IS NULL ASC, fecha_caducidad ASC, fecha_ingreso ASC`,
      [inventarioId]
    );
    return rows;
  }

  async updateLoteStock(connection: PoolConnection, loteId: string, nuevoStock: number): Promise<void> {
    await connection.execute(
      'UPDATE inventario_lotes SET stock_cantidad = ? WHERE id = ?',
      [nuevoStock, loteId]
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // CÓDIGOS DE BARRAS — CRUD
  // ────────────────────────────────────────────────────────────────────────

  async createCodigoBarras(id: string, inventarioId: string, codigoBarra: string): Promise<void> {
    await pool.execute(
      `INSERT INTO inventario_codigos_barras (id, inventario_id, codigo_barra) 
       VALUES (?, ?, ?)`,
      [id, inventarioId, codigoBarra]
    );
  }

  async findCodigosByInventarioId(inventarioId: string): Promise<InventarioCodigoBarrasRow[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT * FROM inventario_codigos_barras 
       WHERE inventario_id = ? 
       ORDER BY fecha_creacion ASC`,
      [inventarioId]
    );
    return rows;
  }

  async deleteCodigoBarras(id: string): Promise<void> {
    await pool.execute(
      'DELETE FROM inventario_codigos_barras WHERE id = ?',
      [id]
    );
  }

  async findCodigoBarrasById(id: string): Promise<InventarioCodigoBarrasRow | null> {
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM inventario_codigos_barras WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }
}
