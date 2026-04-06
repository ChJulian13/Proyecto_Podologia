import type { Request, Response } from 'express';
import { FacturaService } from '../../services/factura/factura.services.js';
import { CreateFacturaSchema, UpdateEstadoFacturaSchema } from '../../domain/factura/factura.domain.js';

export class FacturaController {
  private facturaService = new FacturaService();

  getByCita = async (req: Request, res: Response): Promise<void> => {
    try {
      const { citaId } = req.params;

       if (!citaId || typeof citaId !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la cita es inválido' });
        return;
      }

      const facturas = await this.facturaService.getByCita(citaId);
      res.status(200).json({ success: true, data: facturas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno al obtener facturas' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateFacturaSchema.parse(req.body);
      const nuevaFactura = await this.facturaService.create(validatedData);
      res.status(201).json({ success: true, message: 'Factura generada', data: nuevaFactura });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors }); return;
      }
      switch (error.message) {
        case 'PACIENTE_INVALIDO': res.status(400).json({ success: false, message: 'Paciente inválido para esta clínica' }); return;
        case 'CITA_INVALIDA': res.status(400).json({ success: false, message: 'La cita no coincide con el paciente' }); return;
        case 'NUMERO_FACTURA_DUPLICADO': res.status(409).json({ success: false, message: 'Este número de factura ya existe en la clínica' }); return;
      }
      res.status(500).json({ success: false, message: 'Error al generar la factura' });
    }
  };

  marcarPagada = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

       if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, message: 'El ID de la nota es inválido' });
        return;
      }

      const validatedData = UpdateEstadoFacturaSchema.parse(req.body);
      
      const factura = await this.facturaService.marcarComoPagada(id, validatedData);
      res.status(200).json({ success: true, message: 'Factura marcada como pagada', data: factura });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, errors: error.errors }); return;
      }
      if (error.message === 'FACTURA_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Factura no encontrada' }); return;
      }
      if (error.message === 'FACTURA_YA_PAGADA') {
        res.status(400).json({ success: false, message: 'Esta factura ya fue pagada anteriormente' }); return;
      }
      res.status(500).json({ success: false, message: 'Error al procesar el pago' });
    }
  };
}