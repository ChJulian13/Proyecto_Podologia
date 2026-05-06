import type { Request, Response, NextFunction } from 'express';
import { CitaService } from '../../services/cita/cita.service.js';
import { CreateCitaSchema, UpdateCitaSchema, CreateCitaRapidaSchema } from '../../domain/cita/cita.domain.js';
import { ValidationError } from '../../common/errors/domain.errors.js';

export class CitaController {
  private citaService = new CitaService();

  getAllByClinica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clinicaId } = req.params as Record<string, string>;

      if (typeof clinicaId !== 'string') {
        throw new ValidationError([{ path: ['clinicaId'], message: 'El ID de la clínica es obligatorio y debe ser texto' }]);
      }

      const citas = await this.citaService.getAllByClinica(clinicaId);
      res.status(200).json({ success: true, data: citas });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Zod parse lanzará un ZodError si falla, el middleware lo atrapará
      const validatedData = CreateCitaSchema.parse(req.body);
      const nuevaCita = await this.citaService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Cita agendada exitosamente',
        data: nuevaCita
      });
    } catch (error) {
      next(error);
    }
  };

  agendarCitaRapida = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CreateCitaRapidaSchema.parse(req.body);
      const resultado = await this.citaService.agendarCitaRapida(validatedData);

      res.status(201).json({
        success: true,
        message: 'Paciente registrado y cita agendada exitosamente',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;

      if (typeof id !== 'string') {
        throw new ValidationError([{ path: ['id'], message: 'El ID de la cita es obligatorio y debe ser texto' }]);
      }

      const validatedData = UpdateCitaSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        throw new ValidationError([{ path: ['body'], message: 'No hay datos para actualizar' }]);
      }

      const citaActualizada = await this.citaService.update(id, validatedData);
      res.status(200).json({ success: true, message: 'Cita actualizada', data: citaActualizada });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as Record<string, string>;

      if (typeof id !== 'string') {
        throw new ValidationError([{ path: ['id'], message: 'El ID de la cita es obligatorio y debe ser texto' }]);
      }

      await this.citaService.cancelar(id);
      res.status(200).json({ success: true, message: 'Cita cancelada exitosamente' });
    } catch (error) {
      next(error);
    }
  };

  getToday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // El middleware de autenticación inyecta la info del token en req.usuario
      const usuario = (req as any).usuario;

      if (!usuario || !usuario.clinicaId) {
        // Podríamos usar ForbiddenError aquí si quisiéramos ser más específicos
        res.status(403).json({ success: false, message: 'Acceso denegado o clínica no identificada' });
        return;
      }

      const citasHoy = await this.citaService.getTodayCitas(
        usuario.clinicaId,
        usuario.id,
        usuario.rol
      );

      res.status(200).json({
        success: true,
        data: citasHoy,
        message: citasHoy.length === 0 ? 'No hay citas programadas para hoy' : 'Citas del día obtenidas'
      });
    } catch (error) {
      next(error);
    }
  };
}