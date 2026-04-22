import { Router } from 'express';
import { ClinicaController } from '../../controllers/clinica/clinica.controller.js';

const router = Router();
const clinicaController = new ClinicaController();

router.get('/',  clinicaController.getAll);
router.post('/',  clinicaController.create);
router.patch('/:id',  clinicaController.update);
router.patch('/:id/status',  clinicaController.toggleStatus);

export default router;