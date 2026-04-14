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
}