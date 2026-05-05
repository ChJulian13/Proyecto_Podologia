import { Router } from 'express';
import { AnamnesisController } from '../../controllers/anamnesis/anamnesis.controller.js';

const router = Router();
const anamnesisController = new AnamnesisController();

router.get('/paciente/:pacienteId', anamnesisController.getByPaciente);
router.post('/', anamnesisController.create);
router.patch('/:id', anamnesisController.update);

export default router;
