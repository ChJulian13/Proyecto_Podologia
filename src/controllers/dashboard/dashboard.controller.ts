import type { Response } from 'express';
import { DashboardService } from '../../services/dashboard/dashboard.services.js';
// Asegúrate de que esta ruta apunte correctamente a tu archivo auth.middleware.ts
import type { AuthRequest } from '../../middleware/auth/auth.middleware.js'; 

export class DashboardController {
  private dashboardService = new DashboardService();

  getResumenHoy = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Verificación de seguridad extra (aunque el middleware ya lo valida)
      if (!req.usuario) {
        res.status(401).json({ success: false, message: 'Sesión no válida' });
        return;
      }

      // Extraemos exactamente las variables como las definiste en TokenPayload
      const { clinicaId, id, rol } = req.usuario;
      
      const resumen = await this.dashboardService.getResumenHoy(clinicaId, id, rol);
      res.status(200).json({ success: true, data: resumen });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar el resumen del día' });
    }
  };

  getCitasProximas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.usuario) {
        res.status(401).json({ success: false, message: 'Sesión no válida' });
        return;
      }

      const { clinicaId, id, rol } = req.usuario;
      
      const citas = await this.dashboardService.getProximasCitas(clinicaId, id, rol);
      res.status(200).json({ success: true, data: citas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar las próximas citas' });
    }
  };

  getAlertasNotas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.usuario) {
        res.status(401).json({ success: false, message: 'Sesión no válida' });
        return;
      }

      const { clinicaId, id, rol } = req.usuario;
      
      const alertas = await this.dashboardService.getAlertasNotas(clinicaId, id, rol);
      res.status(200).json({ success: true, data: alertas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar las alertas de notas' });
    }
  };

  getIngresos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.usuario) return; // Middleware ya manejó el 401
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        res.status(400).json({ success: false, message: 'Faltan parámetros fechaInicio o fechaFin' });
        return;
      }

      const ingresos = await this.dashboardService.getIngresos(clinicaId, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: ingresos });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar los ingresos' });
    }
  };

  getServiciosPopulares = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.usuario) return;
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        res.status(400).json({ success: false, message: 'Faltan parámetros fechaInicio o fechaFin' });
        return;
      }

      const servicios = await this.dashboardService.getServiciosPopulares(clinicaId, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: servicios });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar servicios populares' });
    }
  };

  getTasaAsistencia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.usuario) return;
      const { clinicaId } = req.usuario;
      const { fechaInicio, fechaFin } = req.query;

      if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
        res.status(400).json({ success: false, message: 'Faltan parámetros fechaInicio o fechaFin' });
        return;
      }

      const tasas = await this.dashboardService.getTasaAsistencia(clinicaId, fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: tasas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar la tasa de asistencia' });
    }
  };
}