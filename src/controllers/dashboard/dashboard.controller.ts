import type { Response, NextFunction } from 'express';
import { DashboardService } from '../../services/dashboard/dashboard.service.js';
import type { AuthRequest } from '../../middleware/auth/auth.middleware.js';
import { BadRequestError, UnauthorizedError } from '../../common/errors/domain.errors.js';

export class DashboardController {
  private dashboardService = new DashboardService();

  getResumenHoy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId, id, rol } = req.usuario;
      const resumen = await this.dashboardService.getResumenHoy(clinicaId!, id, rol);
      res.status(200).json({ success: true, data: resumen });
    } catch (error) {
      next(error);
    }
  };

  getCitasProximas = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId, id, rol } = req.usuario;
      const citas = await this.dashboardService.getProximasCitas(clinicaId!, id, rol);
      res.status(200).json({ success: true, data: citas });
    } catch (error) {
      next(error);
    }
  };

  getAlertasNotas = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId, id, rol } = req.usuario;
      const alertas = await this.dashboardService.getAlertasNotas(clinicaId!, id, rol);
      res.status(200).json({ success: true, data: alertas });
    } catch (error) {
      next(error);
    }
  };

  getIngresos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        throw new BadRequestError('Faltan parámetros fechaInicio o fechaFin');
      }

      const ingresos = await this.dashboardService.getIngresos(clinicaId!, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: ingresos });
    } catch (error) {
      next(error);
    }
  };

  getServiciosPopulares = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        throw new BadRequestError('Faltan parámetros fechaInicio o fechaFin');
      }

      const servicios = await this.dashboardService.getServiciosPopulares(clinicaId!, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: servicios });
    } catch (error) {
      next(error);
    }
  };

  getTasaAsistencia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        throw new BadRequestError('Faltan parámetros fechaInicio o fechaFin');
      }

      const tasas = await this.dashboardService.getTasaAsistencia(clinicaId!, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: tasas });
    } catch (error) {
      next(error);
    }
  };

  getNuevosPacientes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) throw new UnauthorizedError('Sesión no válida');
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        throw new BadRequestError('Faltan parámetros de fecha');
      }

      const crecimiento = await this.dashboardService.getNuevosPacientes(clinicaId!, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: crecimiento });
    } catch (error) {
      next(error);
    }
  };
}