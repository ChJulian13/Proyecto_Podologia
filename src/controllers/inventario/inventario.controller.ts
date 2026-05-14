import type { Request, Response, NextFunction } from 'express';
import { InventarioService } from '../../services/inventario/inventario.service.js';
import {
  CreateInventarioSchema,
  UpdateInventarioSchema,
  CreateLoteSchema,
  CreateCodigoBarrasSchema,
} from '../../domain/inventario/inventario.domain.js';
import type { AuthRequest } from '../../middleware/auth/auth.middleware.js';
import { ForbiddenError } from '../../common/errors/domain.errors.js';

export class InventarioController {
  private inventarioService = new InventarioService();

  getAllByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { clinicaId } = req.params as Record<string, string>;
      const inventario = await this.inventarioService.getAllByClinica(clinicaId!, rol);
      res.status(200).json({ success: true, data: inventario });
    } catch (error) {
      next(error);
    }
  };

  getProductosVentaByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      if (rol === 'CONTADOR' || rol === 'RECEPCIONISTA') {
        throw new ForbiddenError('No tienes permisos para consultar la lista de productos de venta');
      }
      const { clinicaId } = req.params as Record<string, string>;
      const productos = await this.inventarioService.getProductosVentaByClinica(clinicaId!, rol);
      res.status(200).json({ success: true, data: productos });
    } catch (error) {
      next(error);
    }
  };

  buscarProductosVentaAutocomplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      if (rol === 'CONTADOR' || rol === 'RECEPCIONISTA') {
        throw new ForbiddenError('No tienes permisos para buscar productos de venta');
      }
      const { clinicaId } = req.params as Record<string, string>;
      const termino = req.query.termino as string || '';
      const result = await this.inventarioService.buscarProductosVentaAutocomplete(clinicaId!, termino, rol);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { id } = req.params as Record<string, string>;
      const item = await this.inventarioService.getById(id!, rol);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const validatedData = CreateInventarioSchema.parse(req.body);
      const nuevoItem = await this.inventarioService.create(validatedData, rol);
      res.status(201).json({ success: true, message: 'Artículo registrado exitosamente', data: nuevoItem });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateInventarioSchema.parse(req.body);
      const itemActualizado = await this.inventarioService.update(id!, validatedData, rol);
      res.status(200).json({ success: true, message: 'Artículo actualizado', data: itemActualizado });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { id } = req.params as Record<string, string>;
      await this.inventarioService.delete(id!, rol);
      res.status(200).json({ success: true, message: 'Artículo desactivado exitosamente' });
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // LOTES
  // ────────────────────────────────────────────────────────────────────────

  getLotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const lotes = await this.inventarioService.getLotesByProducto(id!);
      res.status(200).json({ success: true, data: lotes });
    } catch (error) {
      next(error);
    }
  };

  createLote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { id } = req.params as Record<string, string>;
      const validatedData = CreateLoteSchema.parse(req.body);
      const nuevoLote = await this.inventarioService.createLote(id!, validatedData, rol);
      res.status(201).json({ success: true, message: 'Lote registrado exitosamente', data: nuevoLote });
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // CÓDIGOS DE BARRAS
  // ────────────────────────────────────────────────────────────────────────

  getCodigosBarras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const codigos = await this.inventarioService.getCodigosByProducto(id!);
      res.status(200).json({ success: true, data: codigos });
    } catch (error) {
      next(error);
    }
  };

  createCodigoBarras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { id } = req.params as Record<string, string>;
      const validatedData = CreateCodigoBarrasSchema.parse(req.body);
      const nuevoCodigo = await this.inventarioService.createCodigoBarras(id!, validatedData, rol);
      res.status(201).json({ success: true, message: 'Código de barras registrado exitosamente', data: nuevoCodigo });
    } catch (error) {
      next(error);
    }
  };

  deleteCodigoBarras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = (req as AuthRequest).usuario!.rol;
      const { id, codigoId } = req.params as Record<string, string>;
      await this.inventarioService.deleteCodigoBarras(id!, codigoId!, rol);
      res.status(200).json({ success: true, message: 'Código de barras eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}
