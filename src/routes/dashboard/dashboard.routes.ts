import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboard/dashboard.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const dashboardController = new DashboardController();

router.get('/resumen-hoy', verificarToken, dashboardController.getResumenHoy);
router.get('/citas-proximas', verificarToken, dashboardController.getCitasProximas);
router.get('/alertas-notas', verificarToken, dashboardController.getAlertasNotas);
// --- Rutas de Finanzas y Rendimiento ---
router.get('/ingresos', verificarToken, dashboardController.getIngresos);
router.get('/servicios-populares', verificarToken, dashboardController.getServiciosPopulares);
router.get('/tasa-asistencia', verificarToken, dashboardController.getTasaAsistencia);
router.get('/nuevos-pacientes', verificarToken, dashboardController.getNuevosPacientes);

export default router;