import { Router } from 'express';
import { CitaController } from '../../controllers/cita/cita.controller.js';

const router = Router();
const citaController = new CitaController();

// Todas las operaciones de agenda requieren autenticación
router.get('/clinica/:clinicaId',  citaController.getAllByClinica);
router.post('/',  citaController.create);
router.patch('/:id',  citaController.update);
router.delete('/:id',  citaController.delete);

export default router;