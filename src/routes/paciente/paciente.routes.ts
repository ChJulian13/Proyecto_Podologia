import { Router } from 'express';
import { PacienteController } from '../../controllers/paciente/paciente.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const pacienteController = new PacienteController();

// Toda la gestión de pacientes requiere estar logueado y presentar el Token
router.get('/clinica/:clinicaId', verificarToken, pacienteController.getAllByClinica);
router.post('/', verificarToken, pacienteController.create);
router.patch('/:id', verificarToken, pacienteController.update);
router.delete('/:id', verificarToken, pacienteController.delete);

export default router;