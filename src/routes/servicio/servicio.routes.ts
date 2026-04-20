import { Router } from 'express';
import { ServicioController } from '../../controllers/servicio/servicio.controller.js';

const router = Router();
const servicioController = new ServicioController();

router.get('/clinica/:clinicaId',  servicioController.getAllByClinica);
router.post('/',  servicioController.create);
router.patch('/:id',  servicioController.update);
router.delete('/:id',  servicioController.delete);

export default router;