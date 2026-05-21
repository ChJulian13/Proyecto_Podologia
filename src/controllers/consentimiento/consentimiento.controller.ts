import type { Request, Response, NextFunction } from 'express';
import { ConsentimientoService } from '../../services/consentimiento/consentimiento.service.js';
import { CreateConsentimientoSchema, UpdateConsentimientoSchema } from '../../domain/consentimiento/consentimiento.domain.js';
import type { AuthRequest } from '../../middleware/auth/auth.middleware.js';

export class ConsentimientoController {
  private service = new ConsentimientoService();

  getByPaciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pacienteId } = req.params as Record<string, string>;
      const consentimientos = await this.service.getByPaciente(pacienteId!);
      res.status(200).json({ success: true, data: consentimientos });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Inyectar clinicaId desde el token por seguridad
      const clinicaId = (req as AuthRequest).usuario!.clinicaId;
      const validatedData = CreateConsentimientoSchema.parse({
        ...req.body,
        clinica_id: clinicaId
      });
      const nuevo = await this.service.create(validatedData);
      res.status(201).json({ success: true, message: 'Consentimiento generado', data: nuevo });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;
      const validatedData = UpdateConsentimientoSchema.parse(req.body);
      const actualizado = await this.service.update(id!, validatedData);
      res.status(200).json({ success: true, message: 'Consentimiento actualizado', data: actualizado });
    } catch (error) {
      next(error);
    }
  };
}
