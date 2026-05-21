import { Router } from 'express';
import { ConsentimientoController } from '../../controllers/consentimiento/consentimiento.controller.js';

const router = Router();
const controller = new ConsentimientoController();

router.get('/paciente/:pacienteId', controller.getByPaciente);
router.post('/', controller.create);
router.patch('/:id', controller.update);

export default router;
