import type { Request, Response, NextFunction } from 'express';
import { SepomexService } from './sepomex.service.js';

export class SepomexController {
  private sepomexService = new SepomexService();

  getByCP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cp } = req.params as Record<string, string>;
      const direccion = await this.sepomexService.getInfoByCP(cp!);
      res.status(200).json({ success: true, data: direccion });
    } catch (error) {
      next(error);
    }
  };
}