import crypto from 'crypto';
import { pool } from '../../config/database.js';
import { VentaInventarioRepository } from '../../repositories/venta_inventario/venta_inventario.repository.js';
import { InventarioRepository } from '../../repositories/inventario/inventario.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/domain.errors.js';
import {
  mapVentaInventarioRowToEntity,
  type CreateVentaInventarioDTO,
  type VentaInventarioEntity
} from '../../domain/venta_inventario/venta_inventario.domain.js';

export class VentaInventarioService {
  private ventaRepository = new VentaInventarioRepository();
  private inventarioRepository = new InventarioRepository();

  async getByFactura(facturaId: string): Promise<VentaInventarioEntity[]> {
    const rows = await this.ventaRepository.findByFactura(facturaId);
    return rows.map(mapVentaInventarioRowToEntity);
  }

  async getByClinica(clinicaId: string): Promise<VentaInventarioEntity[]> {
    const rows = await this.ventaRepository.findByClinica(clinicaId);
    return rows.map(mapVentaInventarioRowToEntity);
  }

  // ── CREATE VENTA — Operación Transaccional con FEFO ──

  async create(data: CreateVentaInventarioDTO): Promise<VentaInventarioEntity[]> {
    const connection = await pool.getConnection();
    const ventasCreadasIds: string[] = [];

    try {
      await connection.beginTransaction();

      // Iteramos sobre el "carrito de compras"
      for (const prod of data.productos) {
        // 1. Validar que el artículo existe y está activo
        const item = await this.inventarioRepository.findById(prod.inventario_item_id);
        if (!item) {
          throw new NotFoundError(`Artículo de inventario no encontrado: ${prod.inventario_item_id}`);
        }
        if (item.esta_activo !== 1) {
          throw new BadRequestError(`El artículo "${item.nombre}" no está activo para la venta`);
        }

        // 2. Obtener lotes disponibles ordenados FEFO
        const lotesDisponibles = await this.inventarioRepository.findLotesDisponiblesFefo(prod.inventario_item_id);

        // 3. Calcular stock total disponible
        const stockTotal = lotesDisponibles.reduce((sum, l) => sum + l.stock_cantidad, 0);
        if (stockTotal < prod.cantidad) {
          throw new BadRequestError(
            `Stock insuficiente para "${item.nombre}". Disponible: ${stockTotal}, Solicitado: ${prod.cantidad}`
          );
        }

        // 4. Insertar registro de esta línea de venta
        const ventaId = crypto.randomUUID();
        await this.ventaRepository.createWithTransaction(
          connection,
          ventaId,
          data.clinica_id,
          data.paciente_id ?? null,
          data.factura_id ?? null,
          data.vendido_por_id,
          prod.inventario_item_id,
          prod.cantidad,
          prod.precio_venta
        );

        // 5. Algoritmo FEFO — Descontar de lotes en orden de caducidad
        let cantidadRestante = prod.cantidad;

        for (const lote of lotesDisponibles) {
          if (cantidadRestante <= 0) break;

          const descontar = Math.min(cantidadRestante, lote.stock_cantidad);
          const nuevoStockLote = lote.stock_cantidad - descontar;

          // 5a. Actualizar stock del lote
          await this.inventarioRepository.updateLoteStock(connection, lote.id, nuevoStockLote);

          // 5b. Registrar trazabilidad en ventas_inventario_lotes
          const ventaLoteId = crypto.randomUUID();
          await this.ventaRepository.createVentaLote(
            connection,
            ventaLoteId,
            ventaId,
            lote.id,
            descontar
          );

          cantidadRestante -= descontar;
        }

        ventasCreadasIds.push(ventaId);
      }

      // Si todo el ciclo terminó sin errores, consolidamos todo en la base de datos
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 6. Devolver el arreglo de entidades creadas ya mapeadas
    const ventasEntities: VentaInventarioEntity[] = [];
    for (const id of ventasCreadasIds) {
      const row = await this.ventaRepository.findById(id);
      if (row) ventasEntities.push(mapVentaInventarioRowToEntity(row));
    }

    return ventasEntities;
  }

  // ── CANCELAR VENTA — Operación Transaccional con restauración FEFO ──

  async cancelar(id: string): Promise<VentaInventarioEntity> {
    // 1. Buscar la venta
    const venta = await this.ventaRepository.findById(id);
    if (!venta) throw new NotFoundError('Venta de inventario');

    // 2. Verificar que no esté ya cancelada
    if (venta.esta_cancelada === 1) {
      throw new ConflictError('Esta venta ya fue cancelada anteriormente');
    }

    // 3. Obtener los registros de trazabilidad (qué lotes se descontaron)
    const ventaLotes = await this.ventaRepository.findLotesByVentaId(id);

    // 4. Transacción: CANCEL venta + RESTORE stock en cada lote
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 4a. Marcar venta como cancelada
      await this.ventaRepository.cancelWithTransaction(connection, id);

      // 4b. Restaurar stock en cada lote tocado
      for (const ventaLote of ventaLotes) {
        // Leer stock actual del lote
        const [loteRows] = await connection.execute<any[]>(
          'SELECT stock_cantidad FROM inventario_lotes WHERE id = ? LIMIT 1',
          [ventaLote.lote_id]
        );
        const loteActual = loteRows[0];
        if (loteActual) {
          const stockRestaurado = loteActual.stock_cantidad + ventaLote.cantidad;
          await this.inventarioRepository.updateLoteStock(connection, ventaLote.lote_id, stockRestaurado);
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // 5. Devolver la entidad actualizada
    const row = await this.ventaRepository.findById(id);
    return mapVentaInventarioRowToEntity(row!);
  }
}
