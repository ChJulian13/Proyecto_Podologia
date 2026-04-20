import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboard/dashboard.controller.js';

const router = Router();
const dashboardController = new DashboardController();

router.get('/resumen-hoy',  dashboardController.getResumenHoy);
router.get('/citas-proximas',  dashboardController.getCitasProximas);
router.get('/alertas-notas',  dashboardController.getAlertasNotas);
// --- Rutas de Finanzas y Rendimiento ---
router.get('/ingresos',  dashboardController.getIngresos);
router.get('/servicios-populares',  dashboardController.getServiciosPopulares);
router.get('/tasa-asistencia',  dashboardController.getTasaAsistencia);
router.get('/nuevos-pacientes',  dashboardController.getNuevosPacientes);

export default router;