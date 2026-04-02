import { Router } from 'express';
import { CitaController } from '../../controllers/cita/cita.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const citaController = new CitaController();

// Todas las operaciones de agenda requieren autenticación
router.get('/clinica/:clinicaId', verificarToken, citaController.getAllByClinica);
router.post('/', verificarToken, citaController.create);
router.patch('/:id', verificarToken, citaController.update);
router.delete('/:id', verificarToken, citaController.delete);

export default router;