import { Router } from 'express';
import { UsuarioController } from '../../controllers/usuario/usuario.controller.js';

const router = Router();
const usuarioController = new UsuarioController();

router.get('/clinica/:clinicaId',  usuarioController.getAllByClinica);
router.post('/',  usuarioController.create);
router.patch('/:id',  usuarioController.update);
router.delete('/:id',  usuarioController.delete);
router.patch('/:id/password',  usuarioController.updatePassword);

export default router;