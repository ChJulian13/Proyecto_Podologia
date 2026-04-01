import { Router } from 'express';
import { ServicioController } from '../../controllers/servicio/servicio.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const servicioController = new ServicioController();

router.get('/clinica/:clinicaId', verificarToken, servicioController.getAllByClinica);
router.post('/', verificarToken, servicioController.create);
router.patch('/:id', verificarToken, servicioController.update);
router.delete('/:id', verificarToken, servicioController.delete);

export default router;