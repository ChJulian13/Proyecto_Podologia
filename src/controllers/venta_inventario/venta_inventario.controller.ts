import type { Request, Response, NextFunction } from 'express';
import { VentaInventarioService } from '../../services/venta_inventario/venta_inventario.service.js';
import { CreateVentaInventarioSchema } from '../../domain/venta_inventario/venta_inventario.domain.js';

export class VentaInventarioController {
  private ventaService = new VentaInventarioService();

  getByFactura = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { facturaId } = req.params as Record<string, string>;
      const ventas = await this.ventaService.getByFactura(facturaId!);
      res.status(200).json({ success: true, data: ventas });
    } catch (error) {
      next(error);
    }
  };

  getByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clinicaId } = req.params as Record<string, string>;
      const ventas = await this.ventaService.getByClinica(clinicaId!);
      res.status(200).json({ success: true, data: ventas });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateVentaInventarioSchema.parse(req.body);

      const nuevasVentas = await this.ventaService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Ventas registradas exitosamente',
        data: nuevasVentas
      });
    } catch (error) {
      next(error);
    }
  };

  cancelar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const ventaCancelada = await this.ventaService.cancelar(id!);
      res.status(200).json({ success: true, message: 'Venta cancelada y stock restaurado', data: ventaCancelada });
    } catch (error) {
      next(error);
    }
  };
}
