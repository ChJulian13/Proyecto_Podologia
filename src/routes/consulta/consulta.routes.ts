import { Router } from 'express';
import { ConsultaController } from '../../controllers/consulta/consulta.controller.js';

const router = Router();
const consultaController = new ConsultaController();

// ── Rutas principales de Consulta (/api/consultas) ───────────────────────────
router.post('/', consultaController.create);
router.get('/paciente/:pacienteId', consultaController.getByPaciente);
router.get('/cita/:citaId', consultaController.getByCita);
router.get('/:id', consultaController.getById);
router.patch('/:id', consultaController.update);

// ── Sub-recursos de Recetas (/api/consultas/:consultaId/recetas) ──────────────
router.post('/:consultaId/recetas', consultaController.addReceta);
router.delete('/:consultaId/recetas/:recetaId', consultaController.deleteReceta);

export default router;
