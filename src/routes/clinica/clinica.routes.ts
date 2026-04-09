import { Router } from 'express';
import { ClinicaController } from '../../controllers/clinica/clinica.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const clinicaController = new ClinicaController();

router.get('/', verificarToken, clinicaController.getAll);
router.post('/', verificarToken, clinicaController.create);
router.patch('/:id', verificarToken, clinicaController.update);
router.delete('/:id', verificarToken, clinicaController.delete);

export default router;