import type { Request, Response } from 'express';
import { DashboardService } from '../../services/dashboard/dashboard.services.js';

export class DashboardController {
  private dashboardService = new DashboardService();

  getCitasHoy = async (req: Request, res: Response): Promise<void> => {
    try {
      const citas = await this.dashboardService.getCitasDelDia();
      res.status(200).json({ success: true, data: citas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar las citas de hoy' });
    }
  };

  getCitasProximas = async (req: Request, res: Response): Promise<void> => {
    try {
      const citas = await this.dashboardService.getProximasCitas();
      res.status(200).json({ success: true, data: citas });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al cargar las próximas citas' });
    }
  };
}