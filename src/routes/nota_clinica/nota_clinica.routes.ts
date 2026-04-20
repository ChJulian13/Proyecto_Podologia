import { Router } from 'express';
import { NotaClinicaController } from '../../controllers/nota_clinica/nota_clinica.controller.js';

const router = Router();
const notaController = new NotaClinicaController();

router.get('/paciente/:pacienteId',  notaController.getHistorial);
router.get('/cita/:citaId',  notaController.getByCita);

router.post('/',  notaController.create);
router.patch('/:id',  notaController.update);

export default router;