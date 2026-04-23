import { type Request, type Response } from 'express';
import { SepomexService } from '../../services/sepomex/sepomex.services.js';

export class SepomexController {
  private sepomexService = new SepomexService();

  getByCP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cp } = req.params;

      if (!cp || typeof cp !== 'string') {
        res.status(400).json({ success: false, message: 'El código postal es requerido y debe ser válido' });
        return;
      }

      if (!/^\d{5}$/.test(cp)) {
        res.status(400).json({ success: false, message: 'El código postal debe tener 5 dígitos numéricos' });
        return;
      }

      const info = await this.sepomexService.getInfoByCP(cp);
      res.status(200).json({ success: true, data: info });

    } catch (error: any) {
      if (error.message === 'CP_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Código postal no encontrado en la base de datos de SEPOMEX' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error interno al consultar el código postal' });
    }
  };
}