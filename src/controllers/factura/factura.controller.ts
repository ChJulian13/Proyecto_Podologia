import type { Request, Response, NextFunction } from 'express';
import { FacturaService } from '../../services/factura/factura.service.js';
import { CreateFacturaSchema, UpdateEstadoFacturaSchema } from '../../domain/factura/factura.domain.js';

export class FacturaController {
  private facturaService = new FacturaService();

  getByCita = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { citaId } = req.params as Record<string, string>;
      const facturas = await this.facturaService.getByCita(citaId!);
      res.status(200).json({ success: true, data: facturas });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateFacturaSchema.parse(req.body);
      const nuevaFactura = await this.facturaService.create(validatedData);
      res.status(201).json({ success: true, message: 'Factura generada', data: nuevaFactura });
    } catch (error) {
      next(error);
    }
  };

  marcarPagada = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateEstadoFacturaSchema.parse(req.body);
      const factura = await this.facturaService.marcarComoPagada(id!, validatedData);
      res.status(200).json({ success: true, message: 'Factura marcada como pagada', data: factura });
    } catch (error) {
      next(error);
    }
  };
}