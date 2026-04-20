import { Router } from 'express';
import { PacienteController } from '../../controllers/paciente/paciente.controller.js';

const router = Router();
const pacienteController = new PacienteController();

// Toda la gestión de pacientes requiere estar logueado y presentar el Token
router.get('/clinica/:clinicaId',  pacienteController.getAllByClinica);
router.post('/',  pacienteController.create);
router.patch('/:id',  pacienteController.update);
router.delete('/:id',  pacienteController.delete);

export default router;