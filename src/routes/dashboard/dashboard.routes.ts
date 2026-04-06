import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboard/dashboard.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const dashboardController = new DashboardController();

router.get('/citas-hoy', verificarToken, dashboardController.getCitasHoy);
router.get('/citas-proximas', verificarToken, dashboardController.getCitasProximas);

export default router;