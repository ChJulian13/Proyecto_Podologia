import crypto from 'crypto';
import { InventarioRepository } from '../../repositories/inventario/inventario.repository.js';
import { ClinicaRepository } from '../../repositories/clinica/clinica.repository.js';
import { CategoriaInventarioRepository } from '../../repositories/categoria_inventario/categoria_inventario.repository.js';
import { NotFoundError, BadRequestError } from '../../common/errors/domain.errors.js';
import {
  mapInventarioRowToEntity,
  mapLoteRowToEntity,
  mapCodigoBarrasRowToEntity,
  type CreateInventarioDTO,
  type UpdateInventarioDTO,
  type CreateLoteDTO,
  type CreateCodigoBarrasDTO,
  type InventarioEntity,
  type InventarioLoteEntity,
  type InventarioCodigoBarrasEntity,
  type InventarioAutocompleteResult,
} from '../../domain/inventario/inventario.domain.js';

export class InventarioService {
  private inventarioRepository = new InventarioRepository();
  private clinicaRepository = new ClinicaRepository();
  private categoriaRepository = new CategoriaInventarioRepository();

  // ────────────────────────────────────────────────────────────────────────
  // INVENTARIO — Lectura
  // ────────────────────────────────────────────────────────────────────────

  async getAllByClinica(clinicaId: string): Promise<InventarioEntity[]> {
    const rows = await this.inventarioRepository.findAllByClinica(clinicaId);
    return rows.map(mapInventarioRowToEntity);
  }

  async getProductosVentaByClinica(clinicaId: string): Promise<InventarioEntity[]> {
    const rows = await this.inventarioRepository.findProductosVentaByClinica(clinicaId);
    return rows.map(mapInventarioRowToEntity);
  }

  async getById(id: string): Promise<InventarioEntity> {
    const row = await this.inventarioRepository.findById(id);
    if (!row) throw new NotFoundError('Artículo de inventario');
    return mapInventarioRowToEntity(row);
  }

  async buscarProductosVentaAutocomplete(clinicaId: string, termino: string): Promise<InventarioAutocompleteResult[]> {
    if (!termino || termino.trim().length < 2) {
      return [];
    }
    return await this.inventarioRepository.buscarProductosVentaAutocomplete(clinicaId, termino.trim());
  }

  // ────────────────────────────────────────────────────────────────────────
  // INVENTARIO — Escritura (Catálogo)
  // ────────────────────────────────────────────────────────────────────────

  async create(data: CreateInventarioDTO): Promise<InventarioEntity> {
    // Verificar que la clínica exista
    const clinica = await this.clinicaRepository.findById(data.clinica_id);
    if (!clinica) throw new NotFoundError('Clínica');

    // Verificar que la categoría exista y esté activa
    const categoria = await this.categoriaRepository.findById(data.categoria_id);
    if (!categoria) throw new NotFoundError('Categoría de inventario');
    if (categoria.esta_activo !== 1) {
      throw new BadRequestError('La categoría seleccionada no está activa');
    }

    const newId = crypto.randomUUID();

    await this.inventarioRepository.create(
      newId,
      data.clinica_id,
      data.categoria_id,
      data.nombre,
      data.descripcion ?? null,
      data.precio_compra ?? null,
      data.precio_venta ?? null,
      data.requiere_lote ?? false,
      data.requiere_caducidad ?? false,
      data.ubicacion ?? null
    );

    return await this.getById(newId);
  }

  async update(id: string, data: UpdateInventarioDTO): Promise<InventarioEntity> {
    const existingRow = await this.inventarioRepository.findById(id);
    if (!existingRow) throw new NotFoundError('Artículo de inventario');

    // Si se cambia la categoría, verificar que exista y esté activa
    if (data.categoria_id) {
      const categoria = await this.categoriaRepository.findById(data.categoria_id);
      if (!categoria) throw new NotFoundError('Categoría de inventario');
      if (categoria.esta_activo !== 1) {
        throw new BadRequestError('La categoría seleccionada no está activa');
      }
    }

    // Construir objeto de update dinámico
    const updateData: Record<string, any> = {};
    if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id;
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion ?? null;
    if (data.precio_compra !== undefined) updateData.precio_compra = data.precio_compra ?? null;
    if (data.precio_venta !== undefined) updateData.precio_venta = data.precio_venta ?? null;
    if (data.requiere_lote !== undefined) updateData.requiere_lote = data.requiere_lote;
    if (data.requiere_caducidad !== undefined) updateData.requiere_caducidad = data.requiere_caducidad;
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion ?? null;

    await this.inventarioRepository.update(id, updateData);
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.inventarioRepository.findById(id);
    if (!existing) throw new NotFoundError('Artículo de inventario');

    await this.inventarioRepository.softDelete(id);
  }

  // ────────────────────────────────────────────────────────────────────────
  // LOTES — Gestión de existencias
  // ────────────────────────────────────────────────────────────────────────

  async createLote(inventarioId: string, data: CreateLoteDTO): Promise<InventarioLoteEntity> {
    const item = await this.inventarioRepository.findById(inventarioId);
    if (!item) throw new NotFoundError('Artículo de inventario');

    const newId = crypto.randomUUID();

    await this.inventarioRepository.createLote(
      newId,
      inventarioId,
      data.numero_lote,
      data.fecha_caducidad ?? null,
      data.stock_cantidad
    );

    const lotes = await this.inventarioRepository.findLotesByInventarioId(inventarioId);
    const loteCreado = lotes.find(l => l.id === newId);
    return mapLoteRowToEntity(loteCreado!);
  }

  async getLotesByProducto(inventarioId: string): Promise<InventarioLoteEntity[]> {
    const item = await this.inventarioRepository.findById(inventarioId);
    if (!item) throw new NotFoundError('Artículo de inventario');

    const rows = await this.inventarioRepository.findLotesByInventarioId(inventarioId);
    return rows.map(mapLoteRowToEntity);
  }

  // ────────────────────────────────────────────────────────────────────────
  // CÓDIGOS DE BARRAS
  // ────────────────────────────────────────────────────────────────────────

  async createCodigoBarras(inventarioId: string, data: CreateCodigoBarrasDTO): Promise<InventarioCodigoBarrasEntity> {
    const item = await this.inventarioRepository.findById(inventarioId);
    if (!item) throw new NotFoundError('Artículo de inventario');

    const newId = crypto.randomUUID();

    await this.inventarioRepository.createCodigoBarras(
      newId,
      inventarioId,
      data.codigo_barra
    );

    const codigos = await this.inventarioRepository.findCodigosByInventarioId(inventarioId);
    const codigoCreado = codigos.find(c => c.id === newId);
    return mapCodigoBarrasRowToEntity(codigoCreado!);
  }

  async getCodigosByProducto(inventarioId: string): Promise<InventarioCodigoBarrasEntity[]> {
    const item = await this.inventarioRepository.findById(inventarioId);
    if (!item) throw new NotFoundError('Artículo de inventario');

    const rows = await this.inventarioRepository.findCodigosByInventarioId(inventarioId);
    return rows.map(mapCodigoBarrasRowToEntity);
  }

  async deleteCodigoBarras(inventarioId: string, codigoId: string): Promise<void> {
    const item = await this.inventarioRepository.findById(inventarioId);
    if (!item) throw new NotFoundError('Artículo de inventario');

    const codigo = await this.inventarioRepository.findCodigoBarrasById(codigoId);
    if (!codigo) throw new NotFoundError('Código de barras');
    if (codigo.inventario_id !== inventarioId) {
      throw new BadRequestError('El código de barras no pertenece a este producto');
    }

    await this.inventarioRepository.deleteCodigoBarras(codigoId);
  }
}
