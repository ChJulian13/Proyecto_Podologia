import { Router } from 'express';
import { UsuarioController } from '../../controllers/usuario/usuario.controller.js';
import { verificarToken } from '../../middleware/auth/auth.middleware.js';

const router = Router();
const usuarioController = new UsuarioController();

router.get('/clinica/:clinicaId', verificarToken, usuarioController.getAllByClinica);
router.post('/', verificarToken, usuarioController.create);
router.patch('/:id', verificarToken, usuarioController.update);
router.delete('/:id', verificarToken, usuarioController.delete);
router.patch('/:id/password', verificarToken, usuarioController.updatePassword);

export default router;