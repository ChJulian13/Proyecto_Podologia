import { Router } from 'express';
import { ImagenPacienteController } from '../../controllers/imagen_paciente/imagen_paciente.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';
import { uploadMiddleware } from '../../middleware/upload/upload.middleware.js';

const router = Router();
const imagenController = new ImagenPacienteController();

// Consulta y Borrado solo requieren el Token
router.get('/paciente/:pacienteId', verificarToken, imagenController.getByPaciente);
router.get('/nota-clinica/:notaClinicaId', verificarToken, imagenController.getByNotaClinica);

router.delete('/:id', verificarToken, imagenController.delete);

// Subida: Requiere Token Y pasar por el middleware de Multer
router.post('/', verificarToken, uploadMiddleware.single('imagen'), imagenController.create);

export default router;