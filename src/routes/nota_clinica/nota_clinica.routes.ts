import { Router } from 'express';
import { NotaClinicaController } from '../../controllers/nota_clinica/nota_clinica.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const notaController = new NotaClinicaController();

router.get('/paciente/:pacienteId', verificarToken, notaController.getHistorial);
router.get('/cita/:citaId', verificarToken, notaController.getByCita);

router.post('/', verificarToken, notaController.create);
router.patch('/:id', verificarToken, notaController.update);

export default router;