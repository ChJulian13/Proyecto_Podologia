import type { Request, Response, NextFunction } from 'express';
import { InventarioService } from '../../services/inventario/inventario.service.js';
import { CreateInventarioSchema, UpdateInventarioSchema, AjusteStockSchema } from '../../domain/inventario/inventario.domain.js';

export class InventarioController {
  private inventarioService = new InventarioService();

  getAllByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clinicaId } = req.params as Record<string, string>;
      const inventario = await this.inventarioService.getAllByClinica(clinicaId!);
      res.status(200).json({ success: true, data: inventario });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const item = await this.inventarioService.getById(id!);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateInventarioSchema.parse(req.body);
      const nuevoItem = await this.inventarioService.create(validatedData);
      res.status(201).json({ success: true, message: 'Artículo registrado exitosamente', data: nuevoItem });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateInventarioSchema.parse(req.body);
      const itemActualizado = await this.inventarioService.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Artículo actualizado', data: itemActualizado });
    } catch (error) {
      next(error);
    }
  };

  ajustarStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = AjusteStockSchema.parse(req.body);
      const itemActualizado = await this.inventarioService.ajustarStock(id!, validatedData);
      res.status(200).json({ success: true, message: 'Stock ajustado exitosamente', data: itemActualizado });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      await this.inventarioService.delete(id!);
      res.status(200).json({ success: true, message: 'Artículo desactivado exitosamente' });
    } catch (error) {
      next(error);
    }
  };
}
